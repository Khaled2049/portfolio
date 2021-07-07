/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', 'assets/particles.json', function() {
    let w = window.innerWidth + "px";
    let h = window.innerHeight + "px";
    console.log('callback - particles.js config loaded');
    let el = document.querySelector(".particles-js-canvas-el"); 
    el.setAttribute("height", h);
    el.setAttribute("width", w);
    console.log(h);
});