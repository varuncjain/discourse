import Component from "@glimmer/component";
import ClassicComponent from "@ember/component";

import EmberGlimmerComponentManager from "@glimmer/component/-private/ember-component-manager";
import {
  CustomComponentManager,
  setInternalComponentManager,
} from "@glimmer/manager";

import {
  buildArgsWithDeprecations,
  renderedConnectorsFor,
} from "discourse/lib/plugin-connectors";
import { helperContext } from "discourse-common/lib/helpers";
import deprecated from "discourse-common/lib/deprecated";

/**
   A plugin outlet is an extension point for templates where other templates can
   be inserted by plugins.

   ## Usage

   If your handlebars template has:

   ```handlebars
     <PluginOutlet @name="evil-trout" />
   ```

   Then any handlebars files you create in the `connectors/evil-trout` directory
   will automatically be appended. For example:

   plugins/hello/assets/javascripts/discourse/templates/connectors/evil-trout/hello.hbs

   With the contents:

   ```handlebars
     <b>Hello World</b>
   ```

   Will insert <b>Hello World</b> at that point in the template.

**/

export default class PluginOutletComponent extends Component {
  constructor() {
    super(...arguments);

    const args = buildArgsWithDeprecations(
      this.args.args || {},
      this.args.deprecatedArgs || {}
    );

    const context = {
      ...helperContext(),
      get parentView() {
        return this.parentView;
      },
    };

    this.connectors = renderedConnectorsFor(this.args.name, args, context);
  }

  // Traditionally, pluginOutlets had an argument named 'args'. However, that name is reserved
  // in recent versions of ember so we need to migrate to outletArgs
  get outletArgs() {
    return this.args.args || this.args.outletArgs;
  }

  // Some old plugin connectors call `this.parentView.parentView` in order to access/manipuate data in
  // the view containing the PluginOutlet. By default, Glimmer Components do not provide a parentView
  // property, but we need backwards compatibility here. This getter, along with a modified component
  // manager, provide an approximation of the old behaviour along with a deprecation notice.
  get parentView() {
    deprecated(
      `parentView should not be used within plugin outlets. Use the available outlet arguments, or inject a service which can provide the context you need. (outlet: ${this.args.name})`
    );
    return this._parentView;
  }

  // Older plugin outlets have a `tagName` which we need to preserve for backwards-compatibility
  get wrapperComponent() {
    return PluginOutletWithTagNameWrapper;
  }
}

class PluginOutletWithTagNameWrapper extends ClassicComponent {
  get parentView() {
    return this._parentView.parentView;
  }
  set parentView(value) {
    this._parentView = value;
  }
}

// Glimmer components don't normally have a `parentView` property. This custom component manager
// lets us keep approximate parity with the old ClassicComponent plugin-outlet wrapper
class PluginOutletComponentManager extends CustomComponentManager {
  create(owner, componentClass, args, environment, dynamicScope) {
    const result = super.create(...arguments);

    result.component._parentView = dynamicScope.view;
    dynamicScope.view = result.component;

    return result;
  }
}
setInternalComponentManager(
  new PluginOutletComponentManager(
    (owner) => new EmberGlimmerComponentManager(owner)
  ),
  PluginOutletComponent
);
