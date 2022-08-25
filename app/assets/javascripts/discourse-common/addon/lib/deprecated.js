let silenced = false;

export default function deprecated(msg, opts = {}) {
  if (silenced) {
    return;
  }

  msg = ["Deprecation notice:", msg];
  if (opts.since) {
    msg.push(`(deprecated since Discourse ${opts.since})`);
  }
  if (opts.dropFrom) {
    msg.push(`(removal in Discourse ${opts.dropFrom})`);
  }
  msg = msg.join(" ");

  if (opts.raiseError) {
    throw msg;
  }

  let consolePrefix = "";
  if (window.Discourse) {
    // This module doesn't exist in pretty-text/wizard/etc.
    consolePrefix =
      require("discourse/lib/source-identifier").consolePrefix() || "";
  }

  console.warn(consolePrefix, msg); //eslint-disable-line no-console
}

export async function withSilencedDeprecations(callback) {
  if (!require("discourse-common/config/environment").isTesting()) {
    throw "Deprecations cannot be silenced outside tests";
  }
  try {
    silenced = true;
    return await callback();
  } finally {
    silenced = false;
  }
}
