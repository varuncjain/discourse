import { click, visit } from "@ember/test-helpers";
import {
  acceptance,
  exists,
  query,
  updateCurrentUser,
} from "discourse/tests/helpers/qunit-helpers";
import I18n from "I18n";
import { test } from "qunit";
import NotificationFixtures from "discourse/tests/fixtures/notification-fixtures";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Dismiss notification confirmation", function (needs) {
  needs.user();
  let markRead = false;
  needs.hooks.afterEach(() => {
    markRead = false;
  });
  needs.pretender((server, helper) => {
    server.put("/notifications/mark-read", () => {
      markRead = true;
      return helper.response({ success: true });
    });
    server.get("/notifications", () => {
      const data = cloneJSON(NotificationFixtures["/notifications"]);
      if (markRead) {
        data.notifications.forEach((notification) => {
          notification.read = true;
        });
      }
      return helper.response(data);
    });
  });

  test("does not show modal when no high priority notifications", async function (assert) {
    await visit("/");
    await click(".current-user");
    await click(".notifications-dismiss");
    assert.notOk(exists(".dismiss-notification-confirmation"));
  });

  test("shows confirmation modal", async function (assert) {
    updateCurrentUser({
      unread_high_priority_notifications: 2,
    });
    await visit("/");
    await click(".current-user");
    await click(".notifications-dismiss");
    assert.ok(exists(".dismiss-notification-confirmation"));

    assert.strictEqual(
      query(".dismiss-notification-confirmation-modal .modal-body").innerText,
      I18n.t("notifications.dismiss_confirmation.body", { count: 2 })
    );
  });

  test("marks unread when confirm and closes modal", async function (assert) {
    updateCurrentUser({
      unread_high_priority_notifications: 2,
    });
    await visit("/");
    await click(".current-user");
    await click(".notifications-dismiss");

    assert.strictEqual(
      query(".dismiss-notification-confirmation-modal .btn-primary").innerText,
      I18n.t("notifications.dismiss_confirmation.dismiss")
    );

    await click(".dismiss-notification-confirmation-modal .btn-primary");

    assert.notOk(exists(".dismiss-notification-confirmation"));
  });

  test("does marks unread when cancel and closes modal", async function (assert) {
    updateCurrentUser({
      unread_high_priority_notifications: 2,
    });
    await visit("/");
    await click(".current-user");
    await click(".notifications-dismiss");

    assert.strictEqual(
      query(".dismiss-notification-confirmation-modal .btn-default").innerText,
      I18n.t("notifications.dismiss_confirmation.cancel")
    );

    await click(".dismiss-notification-confirmation-modal .btn-default");

    assert.notOk(exists(".dismiss-notification-confirmation"));
  });

  test("all unread notifications lose their highlight after dismissing", async function (assert) {
    await visit("/");
    await click(".current-user");
    assert.ok(exists("#quick-access-notifications li:not(.read)"));
    await click(".notifications-dismiss");
    assert.ok(!exists("#quick-access-notifications li:not(.read)"));
    assert.ok(exists("#quick-access-notifications li.read"));
  });
});
