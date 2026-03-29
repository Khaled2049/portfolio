/* ============================================================
   SCROLL REVEAL
============================================================ */
export function initScrollReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 },
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });
}
