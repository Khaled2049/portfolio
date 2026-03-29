/* ============================================================
   SECTION LOADER
============================================================ */
const SECTIONS = [
  "sections/hero.html",
  "sections/work-experience.html",
  "sections/projects.html",
  "sections/education.html",
  "sections/about.html",
];

export async function loadSections() {
  const container = document.getElementById("page-content");
  const responses = await Promise.all(
    SECTIONS.map(function (url) {
      return fetch(url);
    }),
  );
  const htmlFragments = await Promise.all(
    responses.map(function (res) {
      if (!res.ok) throw new Error("Failed to load: " + res.url);
      return res.text();
    }),
  );
  const temp = document.createElement("div");
  htmlFragments.forEach(function (html) {
    temp.innerHTML = html;
    while (temp.firstChild) {
      container.appendChild(temp.firstChild);
    }
  });
  // Scripts injected via innerHTML are inert — re-create them so they execute
  container.querySelectorAll("script").forEach(function (oldScript) {
    const newScript = document.createElement("script");
    if (oldScript.type) newScript.type = oldScript.type;
    if (oldScript.src) {
      newScript.src = oldScript.src;
    } else {
      newScript.textContent = oldScript.textContent;
    }
    oldScript.replaceWith(newScript);
  });
}
