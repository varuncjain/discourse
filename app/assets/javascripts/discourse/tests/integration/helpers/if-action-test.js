import { assert, module, test } from "qunit";
import { setupRenderingTest } from "discourse/tests/helpers/component-test";
import { click, render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";
import Component from "@ember/component";

class TestComponent extends Component {}

module("Integration | Helper | if-action", function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // eslint-disable-next-line no-undef
    Ember.TEMPLATES[
      "components/test-component"
    ] = hbs`<button type="button" {{on "click" this.action}}>Test!</button>`;
    this.registry.register("component:test-component", TestComponent);
  });

  test("The action exists", async function () {
    this.set("value", null);
    this.set("onClick", () => this.set("value", "foo"));
    await render(hbs`<TestComponent @action={{if-action this.onClick}} />`);
    await click("button");

    assert.equal(this.value, "foo");
  });

  test("The action doesn't exist", async function () {
    await render(hbs`<TestComponent @action={{if-action this.onClick}} />`);
    await click("button");

    assert.ok(true, "it didn't raise an error");
  });

  test("[no-op] The action exists", async function () {
    this.set("value", null);
    this.set("onClick", () => this.set("value", "foo"));
    await render(hbs`<TestComponent @action={{or this.onClick (no-op)}} />`);
    await click("button");

    assert.equal(this.value, "foo");
  });

  test("[no-op] The action doesn't exist", async function () {
    await render(hbs`<TestComponent @action={{or this.onClick (no-op)}} />`);
    await click("button");

    assert.ok(true, "it didn't raise an error");
  });
});
