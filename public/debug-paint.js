// Temporary paint diagnostic for the iPhone black-bar report. Runs only with ?debug-paint in the URL. Remove after use.
(function () {
  if (!/debug-paint/.test(location.search)) return;
  function d(e) {
    if (!e || !e.getBoundingClientRect) return "";
    var r = e.getBoundingClientRect(), c = getComputedStyle(e);
    var cls = (typeof e.className === "string" ? e.className : (e.className && e.className.baseVal) || "").slice(0, 40);
    return e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (cls ? "." + cls.replace(/\s+/g, ".") : "") +
      " [" + Math.round(r.left) + "," + Math.round(r.top) + " " + Math.round(r.width) + "x" + Math.round(r.height) + "]" +
      " bg=" + c.backgroundColor + " pos=" + c.position + " z=" + c.zIndex + " op=" + c.opacity +
      (c.filter !== "none" ? " filter=" + c.filter.slice(0, 30) : "") +
      (c.backdropFilter && c.backdropFilter !== "none" ? " bd=" + c.backdropFilter : "");
  }
  function run() {
    var out = [
      "viewport " + innerWidth + "x" + innerHeight + " dpr=" + devicePixelRatio + " theme=" + document.documentElement.dataset.theme + " splash=" + document.documentElement.dataset.splash,
      "UA " + navigator.userAgent.slice(0, 90),
      "--- stack at (20,76):",
    ];
    (document.elementsFromPoint(20, 76) || []).forEach(function (e) { out.push(d(e)); });
    out.push("--- stack at (20,30):");
    (document.elementsFromPoint(20, 30) || []).forEach(function (e) { out.push(d(e)); });
    out.push("--- body children:");
    [].forEach.call(document.body.children, function (e) { if (e.tagName !== "SCRIPT" && e.tagName !== "LINK") out.push(d(e)); });
    out.push("--- boxes near top-left:");
    [].forEach.call(document.querySelectorAll("*"), function (e) {
      var r = e.getBoundingClientRect();
      if (r.left < 10 && r.top < 120 && r.width > 20 && r.width < 200 && r.height > 8) out.push(d(e));
    });
    var p = document.createElement("pre");
    p.textContent = out.join("\n");
    p.style.cssText = "position:fixed;left:6px;right:6px;bottom:6px;max-height:55vh;overflow:auto;z-index:99999;margin:0;padding:10px;background:#fff;color:#000;border:2px solid red;font:10px/1.35 monospace;white-space:pre-wrap";
    document.body.appendChild(p);
  }
  addEventListener("load", function () { setTimeout(run, 4000); });
})();
