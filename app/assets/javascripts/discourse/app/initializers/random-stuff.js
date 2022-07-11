export default {
  name: "random-stuff",
  after: "inject-objects",

  initialize(container) {
    container.owner.register(
      "post-menu:extra-buttons",
      {},
      {
        instantiate: false,
      }
    );

    container.owner.register(
      "post-menu:remove-buttons",
      {},
      {
        instantiate: false,
      }
    );
  },
};
