import { helper } from "@ember/component/helper";

function noOp() {
  return () => {};
}

export default helper(noOp);
