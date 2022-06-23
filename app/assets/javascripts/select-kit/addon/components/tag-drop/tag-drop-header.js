import ComboBoxSelectBoxHeaderComponent from "select-kit/components/combo-box/combo-box-header";
import layout from "select-kit/templates/components/tag-drop/tag-drop-header";
import { bool } from "@ember/object/computed";

export default ComboBoxSelectBoxHeaderComponent.extend({
  layout,
  classNames: "tag-drop-header",
  shouldDisplayClearableButton: bool("value"),
});
