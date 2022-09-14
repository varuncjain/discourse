import { decode } from "blurhash";

// Min size in pixels for consideration for lazy loading
const MINIMUM_SIZE = 0;

function forEachImage(post, callback) {
  post.querySelectorAll("img").forEach((img) => {
    if (img.width >= MINIMUM_SIZE && img.height >= MINIMUM_SIZE) {
      callback(img);
    }
  });
}

function isLoaded(img) {
  // In Safari, img.complete sometimes returns true even when the image is not loaded.
  // naturalHeight seems to be a more reliable check
  return !!img.naturalHeight;
}

export function nativeLazyLoading(api) {
  api.decorateCookedElement(
    (post) => {
      const siteSettings = api.container.lookup("service:site-settings");

      forEachImage(post, (img) => {
        img.loading = "lazy";

        if (siteSettings.secure_media) {
          // Secure media requests go through the app. In topics with many images,
          // this makes it very easy to hit rate limiters. Skipping the low-res
          // placeholders reduces the chance of this problem occuring.
          return;
        }

        let smallUpload;

        if (img.dataset.blurhash) {
          const pixels = decode(img.dataset.blurhash, 50, 50);
          const canvas = document.createElement("canvas");
          canvas.width = 50;
          canvas.height = 50;
          const ctx = canvas.getContext("2d");
          const imageData = ctx.createImageData(50, 50);
          imageData.data.set(pixels);
          ctx.putImageData(imageData, 0, 0);
          smallUpload = canvas.toDataURL();
        } else {
          smallUpload = img.dataset.smallUpload;
        }

        if (smallUpload) {
          if (!isLoaded(img)) {
            if (!img.onload) {
              img.onload = () => {
                img.style.removeProperty("background-image");
                img.style.removeProperty("background-size");
              };
            }

            img.style.setProperty("background-image", `url(${smallUpload})`);
            img.style.setProperty("background-size", "cover");
          }
        }
      });
    },
    {
      onlyStream: true,
      id: "discourse-lazy-load-after-adopt",
      afterAdopt: true,
    }
  );
}
