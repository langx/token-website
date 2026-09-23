// Hero: stagger the characters in, then settle into the hard shadow.
//
// Loaded with `defer`, after gsap.min.js and SplitText.min.js, so the page is
// never waiting on the animation to paint. The `intro` class on <html> (set by
// the inline script in <head>) keeps the heading hidden only until this runs,
// and it drops on its own after 1.5s — if GSAP is missing the heading just sits
// there. It only starts once the tab is actually visible, so a page opened in a
// background tab never renders as a blank hero.
(function () {
  var root = document.documentElement;
  var heading = document.querySelector("#hero h1");

  function reveal() {
    root.classList.remove("intro");
  }

  if (
    !heading ||
    typeof gsap === "undefined" ||
    typeof SplitText === "undefined" ||
    (window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  ) {
    reveal();
    return;
  }

  function play() {
    // Arabic letters join; splitting them into characters would draw every
    // letter in its isolated form. Words keep the script intact.
    var byChar = root.getAttribute("dir") !== "rtl";
    var split = new SplitText(heading, { type: byChar ? "words,chars" : "words" });
    var parts = byChar ? split.chars : split.words;
    var tl = gsap.timeline();

    gsap.set("#hero h1, #hero .lede", { perspective: 400 });
    reveal();

    tl.from(parts, {
      duration: 0.2,
      textShadow: "0px 0px 0px #ff571a",
      y: 40,
      opacity: 0,
      ease: "expo",
      stagger: 0.04,
    });
    tl.to(parts, {
      duration: 0.7,
      textShadow: "0px 5px 0px #ff571a, 0px 10px 0px rgba(255, 87, 26, 0.22)",
      ease: "back",
      stagger: 0.04,
    });
    tl.from("#hero .lede", { duration: 1.4, ease: "expo", y: 24, opacity: 0 }, "-=0.8");
  }

  if (document.visibilityState === "visible") {
    play();
  } else {
    reveal();
    document.addEventListener("visibilitychange", function onShow() {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", onShow);
      play();
    });
  }
})();
