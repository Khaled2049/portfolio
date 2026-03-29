/* ============================================================
   BOOT
============================================================ */
import { loadSections } from "./loader.js";
import { initThreeEffects } from "./scene.js";
import { initNav } from "./nav.js";
import { initScrollReveal } from "./reveal.js";

/* Shared scroll state — written by scroll listener, read by Three.js animation loop */
const scrollState = { value: 0 };

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

    initThreeEffects(scrollState);
    initNav();
    initScrollReveal();
  })
  .catch(function (err) {
    console.error("Section load failed:", err);
  });
