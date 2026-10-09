// SinnDiskret – kleine Helfer ohne externe Abhängigkeiten.
// Es wird nichts gespeichert und nichts an einen Server gesendet.
(function () {
  "use strict";

  // Kopfzeile: feine Linie, sobald gescrollt wird
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Abschnitte sanft einblenden
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Fragebogen -> E-Mail-Entwurf
  var form = document.getElementById("quiz");
  if (!form) return;
  form.hidden = false;

  var ADDRESS = "mail@sinndiskret.de";
  var steps = Array.prototype.slice.call(form.querySelectorAll(".step"));
  var QUESTIONS = steps.length - 1;
  var current = 0;
  var back = document.getElementById("quiz-back");
  var next = document.getElementById("quiz-next");
  var count = document.getElementById("quiz-count");
  var bar = document.getElementById("quiz-bar");
  var preview = document.getElementById("quiz-preview");
  var mailBtn = document.getElementById("quiz-mail");
  var copyBtn = document.getElementById("quiz-copy");
  var status = document.getElementById("quiz-status");
  var telField = document.getElementById("tel-field");

  function values(name) {
    return Array.prototype.map.call(form.querySelectorAll('[name="' + name + '"]:checked'), function (i) { return i.value; });
  }
  function value(name) {
    var el = form.elements[name];
    return el ? String(el.value || "").trim() : "";
  }

  function valid(i) {
    switch (i) {
      case 0: return values("thema").length > 0;
      case 1: return values("wer").length > 0 && values("ort").length > 0;
      case 3:
        if (!value("name")) return false;
        if (values("kanal")[0] === "telefon" && !value("telefon")) return false;
        return true;
      default: return true;
    }
  }

  function compose() {
    var name = value("name");
    var lines = [
      "Hallo Daniel,",
      "",
      "ich interessiere mich für ein Coaching.",
      "",
      "Worum es geht: " + values("thema").join(", "),
      "Das Coaching ist " + values("wer")[0] + ".",
      "Treffen am liebsten: " + values("ort")[0]
    ];
    var msg = value("nachricht");
    if (msg) lines.push("", "In meinen Worten:", msg);
    lines.push("");
    if (values("kanal")[0] === "telefon") {
      lines.push("Bitte ruf mich an: " + value("telefon"));
    } else {
      lines.push("Bitte antworte mir per E-Mail.");
    }
    var times = values("zeit");
    if (times.length) lines.push("Gut erreichbar: " + times.join(", "));
    lines.push("", "Viele Grüße", name);
    return { subject: "Anfrage Coaching – " + name, body: lines.join("\n") };
  }

  function render() {
    steps.forEach(function (s, i) { s.classList.toggle("active", i === current); });
    var done = current === QUESTIONS;
    count.textContent = done ? "Fertig" : "Frage " + (current + 1) + " von " + QUESTIONS;
    bar.style.width = (done ? 100 : (current / QUESTIONS) * 100) + "%";
    back.style.visibility = current === 0 ? "hidden" : "visible";
    next.style.display = done ? "none" : "";
    next.textContent = current === QUESTIONS - 1 ? "Nachricht erstellen" : "Weiter";
    next.disabled = !valid(current);
    status.textContent = "";
    if (done) {
      var m = compose();
      preview.textContent = "Betreff: " + m.subject + "\n\n" + m.body;
      mailBtn.href = "mailto:" + ADDRESS +
        "?subject=" + encodeURIComponent(m.subject) +
        "&body=" + encodeURIComponent(m.body);
    }
  }

  function go(delta) {
    current = Math.max(0, Math.min(QUESTIONS, current + delta));
    render();
    var legend = steps[current].querySelector("legend");
    if (legend) { legend.setAttribute("tabindex", "-1"); legend.focus({ preventScroll: true }); }
    var top = form.getBoundingClientRect().top;
    if (top < 70) form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("input", function () { next.disabled = !valid(current); });
  form.addEventListener("change", function () {
    telField.hidden = values("kanal")[0] !== "telefon";
    next.disabled = !valid(current);
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && !next.disabled && current < QUESTIONS) {
      e.preventDefault(); go(1);
    }
  });
  next.addEventListener("click", function () { if (valid(current)) go(1); });
  back.addEventListener("click", function () { go(-1); });

  copyBtn.addEventListener("click", function () {
    var text = "An: " + ADDRESS + "\n" + preview.textContent;
    var ok = function () { status.textContent = "Kopiert. Füg den Text in eine E-Mail an " + ADDRESS + " ein."; };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); ok(); } catch (err) { status.textContent = "Bitte markiere den Text oben und kopiere ihn von Hand."; }
      document.body.removeChild(ta);
    }
  });

  render();
})();
