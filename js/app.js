/* GREET Nursing College — menu, dropdowns, reveals, mailto form
   SITE_URL: https://www.greetnursingcollege.in/
   Update this constant AND the SITE_URL HTML comment in each page's <head>
   when the custom domain (greetnursingcollege.in) goes live. */
(function () {
  "use strict";

  var SITE_URL = "https://www.greetnursingcollege.in/";

  /* ---------- mobile menu ---------- */
  var toggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");
  function closeMenu() {
    if (!nav) return;
    nav.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    closeDrops();
  }
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }
  /* Escape closes the mobile menu */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- nav dropdowns: hover-only on desktop, tap-toggle on touch ---------- */
  var fineHover = window.matchMedia("(hover:hover) and (pointer:fine)");
  function desktopHover() { return window.innerWidth > 1280 && fineHover.matches; }
  function pointInTriangle(px, py, ax, ay, bx, by, cx, cy) {
    var d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
    if (!d) return false;
    var l1 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d;
    var l2 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d;
    return l1 >= 0 && l2 >= 0 && (1 - l1 - l2) >= 0;
  }
  function closeDrops() {
    Array.prototype.slice.call(document.querySelectorAll(".nav-drop.open, .nav-drop.hover-lock, .nav-drop.grace")).forEach(function (d) {
      d.classList.remove("open", "hover-lock", "grace");
      var b = d.querySelector(".nav-drop-btn");
      if (b) b.setAttribute("aria-expanded", "false");
    });
  }
  Array.prototype.slice.call(document.querySelectorAll(".nav-drop")).forEach(function (drop) {
    var btn = drop.querySelector(".nav-drop-btn");
    var menu = drop.querySelector(".nav-drop-menu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function (e) {
      if (desktopHover() && e.detail !== 0) return;
      e.stopPropagation();
      var isOpen = drop.classList.contains("open");
      closeDrops();
      if (!isOpen) {
        drop.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
    var graceTimer = null;
    function onGraceMove(ev) {
      if (drop.matches(":hover")) { endGrace(false); return; }
      var t = drop._tri;
      if (t && pointInTriangle(ev.clientX, ev.clientY, t[0], t[1], t[2], t[3], t[4], t[5])) return;
      endGrace(true);
    }
    function endGrace(lockIt) {
      if (graceTimer) { clearTimeout(graceTimer); graceTimer = null; }
      document.removeEventListener("mousemove", onGraceMove);
      drop.classList.remove("grace");
      drop._tri = null;
      if (lockIt) drop.classList.add("hover-lock");
    }
    drop.addEventListener("mouseenter", function () {
      if (!desktopHover()) return;
      endGrace(false);
      drop.classList.remove("hover-lock");
    });
    drop.addEventListener("mouseleave", function (e) {
      var wasLocked = drop.classList.contains("hover-lock");
      drop.classList.remove("hover-lock");
      if (!desktopHover() || wasLocked) return;
      var btnR = btn.getBoundingClientRect();
      var menuR = menu.getBoundingClientRect();
      var sx = e.clientX, sy = e.clientY, ax, ay, bx, by;
      if (sy < menuR.top) { ax = menuR.left; ay = menuR.top; bx = menuR.right; by = menuR.top; }
      else { ax = btnR.left; ay = btnR.bottom; bx = btnR.right; by = btnR.bottom; }
      drop._tri = [sx, sy, ax, ay, bx, by];
      drop.classList.add("grace");
      graceTimer = setTimeout(function () { endGrace(true); }, 500);
      document.addEventListener("mousemove", onGraceMove);
    });
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav-drop")) closeDrops();
  });

  /* highlight the parent dropdown button when a child link is active */
  Array.prototype.slice.call(document.querySelectorAll(".nav-drop")).forEach(function (drop) {
    var btn = drop.querySelector(".nav-drop-btn");
    if (btn && drop.querySelector("a.active")) btn.classList.add("active");
  });

  /* ---------- header shadow ---------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
      if (fineHover.matches && window.innerWidth > 1280) {
        Array.prototype.slice.call(document.querySelectorAll(".nav-drop")).forEach(function (d) {
          if (d.matches(":hover") && !d.classList.contains("open") && !d.classList.contains("hover-lock")) {
            d.classList.add("hover-lock");
          }
        });
      }
    }, { passive: true });
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal:not(.in)").forEach(function (el) {
    io.observe(el);
  });

  /* ---------- enquiry form → mailto ---------- */
  var form = document.getElementById("queryForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var subject = "Admission enquiry — " + (d.get("course") || "General");
      var body =
        "Name: " + d.get("name") + "\n" +
        "Phone: " + d.get("phone") + "\n" +
        "Email: " + d.get("email") + "\n" +
        "Programme: " + d.get("course") + "\n\n" +
        d.get("message");
      window.location.href =
        "mailto:greetnursingcollege2023@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- expose for QA/debugging ---------- */
  window.GREET_NURSING = { SITE_URL: SITE_URL };
})();
