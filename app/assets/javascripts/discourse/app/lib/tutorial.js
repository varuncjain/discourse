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
            const currentUser = instance.props.currentUser;
            currentUser.setUserOption(instance.props.userOptionKey, true);
            event.preventDefault();
          });

        instance.popper
          .querySelector(".btn-flat")
          .addEventListener("click", (event) => {
            instance.destroy();
            const currentUser = instance.props.currentUser;
            currentUser.setUserOption("skip_new_user_tips", true);
            event.preventDefault();
          });
      },
    };
  },
};

export function showTutorial(instance, options) {
  if (instance) {
    instance.destroy();
  }

  const userOptionKey = "skip_" + options.tutorial.replaceAll("-", "_");
  if (options.currentUser[userOptionKey]) {
    return;
  }

  instance = tippy(options.reference, {
    placement: options.placement,

    plugins: [tutorialPlugin],

    // Current user is used to keep track of tutorials.
    currentUser: options.currentUser,

    // Key used to save state.
    userOptionKey,

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

    content:
      `<div class='education-popup-container'>
        <div class='education-popup'>
          <div class='education-title'>${options.educationTitle}</div>
          <div class='education-content'>${options.educationContent}</div>
          <div class='education-buttons'>
            <button class="btn btn-primary">${options.educationPrimary}</button>
            <button class="btn btn-flat btn-text">${
              options.educationSecondary ||
              I18n.t("tutorial.education_secondary")
            }</button>
          </div>
        </div>
        ` +
      (options.educationImage
        ? `<div class='education-image'>
          <img src="${options.educationImage}" />
        </div>`
        : "") +
      `</div>`,
  });

  return instance;
}

export function hideTutorial(instance) {
  if (instance) {
    instance.destroy();
  }

  return null;
}
