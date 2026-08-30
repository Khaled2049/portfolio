/* ============================================================
   BOOT
============================================================ */
import { loadSections } from "./loader.js";
import { initThreeEffects } from "./scene.js";
import { initNav } from "./nav.js";
import { initScrollReveal } from "./reveal.js";

/* Shared scroll state — written by scroll listener, read by Three.js animation loop */
const scrollState = { value: 0 };

/* Boot overlay stays up until the sections are in the DOM and the hero has
   rendered its first frame, so nav + hero never pop into place. Capped so a
   slow CDN or a failed scene can never leave the page hidden. */
const BOOT_TIMEOUT_MS = 6000;
let bootFinished = false;

function finishBoot() {
  if (bootFinished) return;
  bootFinished = true;
  document.documentElement.classList.remove("is-booting");
  initScrollReveal();
}

const bootTimer = setTimeout(finishBoot, BOOT_TIMEOUT_MS);

function readyToReveal() {
  clearTimeout(bootTimer);
  finishBoot();
}

loadSections()
  .then(function () {
    /* Track scroll progress for particle convergence.
       Particles fully form by the time the user has scrolled
       65 % of the hero height. */
    window.addEventListener(
      "scroll",
      function () {
        scrollState.value = Math.min(
          window.scrollY / (window.innerHeight * 0.65),
          1.0,
        );
      },
      { passive: true },
    );

    initNav();

    /* Wait on the fonts too — a late swap is its own kind of jump. */
    const heroReady = new Promise(function (resolve) {
      initThreeEffects(scrollState, resolve);
    });
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

    Promise.all([heroReady, fontsReady]).then(readyToReveal);
  })
  .catch(function (err) {
    console.error("Section load failed:", err);
    readyToReveal();
  });
