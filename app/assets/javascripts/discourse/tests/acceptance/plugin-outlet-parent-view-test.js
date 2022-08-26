import { acceptance, query } from "discourse/tests/helpers/qunit-helpers";
import { hbs } from "ember-cli-htmlbars";
import { test } from "qunit";
import { visit } from "@ember/test-helpers";
import { withSilencedDeprecations } from "discourse-common/lib/deprecated";

const CONNECTOR =
  "javascripts/single-test/connectors/user-profile-primary/hello";

acceptance("Plugin Outlet - Deprecated parentView", function (needs) {
  needs.hooks.beforeEach(() => {
    // eslint-disable-next-line no-undef
    Ember.TEMPLATES[
      CONNECTOR
    ] = hbs`<span class='hello-username'>{{parentView.parentView.class}}</span>`;
  });

  needs.hooks.afterEach(() => {
    // eslint-disable-next-line no-undef
    delete Ember.TEMPLATES[CONNECTOR];
  });

  test("Can access parentview", async function (assert) {
    await withSilencedDeprecations(async () => {
      await visit("/u/eviltrout");

      assert.strictEqual(
        query(".hello-username").innerText,
        "user-main",
        "it renders a value from parentView.parentView"
      );
    });
  });
});
