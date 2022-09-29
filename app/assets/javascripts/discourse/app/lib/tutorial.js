import I18n from "I18n";
import tippy from "tippy.js";

// Plugin used to implement actions of the two buttons
const tutorialPlugin = {
  name: "tutorial",

  fn(instance) {
    return {
      onCreate() {
        instance.popper
          .querySelector(".btn-primary")
          .addEventListener("click", (event) => {
            instance.destroy();
            const { currentUser, tutorial } = instance.props;
            currentUser.setUserOption(getUserOptionKey(tutorial), true);
            event.preventDefault();
          });

        instance.popper
          .querySelector(".btn-flat")
          .addEventListener("click", (event) => {
            instance.destroy();
            const { currentUser } = instance.props;
            currentUser.setUserOption("skip_new_user_tips", true);
            event.preventDefault();
          });
      },
    };
  },
};

function getUserOptionKey(tutorial) {
  return `skip_${tutorial.replaceAll("-", "_")}`;
}

function getAppEventsKey(tutorial) {
  return `dismiss-tutorial:${tutorial}`;
}

export function showTutorial(instance, options) {
  if (instance) {
    instance.destroy();
  }

  if (!options.currentUser || !options.reference) {
    return;
  }

  const key = getUserOptionKey(options.tutorial);
  if (options.currentUser[key]) {
    return;
  }

  instance = tippy(options.reference, {
    placement: options.placement,

    plugins: [tutorialPlugin],

    // Current user is used to keep track of tutorials.
    currentUser: options.currentUser,

    // Key used to save state.
    tutorial: options.tutorial,

    // Event handler used with appEvents
    hideTutorial: () => hideTutorial(instance),

    // Tippy must be displayed as soon as possible and not be hidden unless
    // the user clicks on one of the two buttons.
    showOnCreate: true,
    hideOnClick: false,
    trigger: "manual",

    // It must be interactive to make buttons work.
    interactive: true,

    // The default max width is 350px and that is not enough to fit the
    // buttons.
    maxWidth: "none",

    // The arrow does not look very good yet.
    arrow: false,

    // It often happens for the reference element to be rerendered. In this
    // case, tippy must be rerendered too. Having an animation means that the
    // animation will replay over and over again.
    animation: false,

    // The `content` property below is HTML.
    allowHTML: true,

    content: `<div class='tutorial-popup-container'>
        <div class='tutorial-popup'>
          <div class='tutorial-title'>${options.titleText}</div>
          <div class='tutorial-content'>${options.contentText}</div>
          <div class='tutorial-buttons'>
            <button class="btn btn-primary">${
              options.primaryBtnText || I18n.t("tutorial.primary")
            }</button>
            <button class="btn btn-flat btn-text">${
              options.secondaryBtnText || I18n.t("tutorial.secondary")
            }</button>
          </div>
        </div>
      </div>`,
  });

  options.currentUser.appEvents.on(
    getAppEventsKey(options.tutorial),
    instance.props.hideTutorial
  );

  return instance;
}

export function hideTutorial(instance) {
  if (!instance || instance.state.isDestroyed) {
    return;
  }

  instance.props.currentUser.appEvents.off(
    getAppEventsKey(instance.props.tutorial),
    instance.props.hideTutorial
  );

  instance.destroy();
}

export function dismissTutorial(user, tutorial) {
  if (!user) {
    return;
  }

  user.appEvents.trigger(`dismiss-tutorial:${tutorial}`);
  return user.setUserOption(getUserOptionKey(tutorial), true);
}
