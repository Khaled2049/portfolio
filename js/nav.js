/* ============================================================
   NAVIGATION SCROLL BEHAVIOUR
============================================================ */
export function initNav() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  window.addEventListener(
    "scroll",
    function () {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    },
    { passive: true },
  );
}
