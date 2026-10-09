// Temporary on-device test panel for the iPhone black block. Runs only with ?debug-paint. Remove after use.
(function () {
  if (!/debug-paint/.test(location.search)) return;
  var tests = [
    ["1 Hide header", "header.site-header{visibility:hidden!important}"],
    ["2 Header no bg/border", ".site-header{background:transparent!important;border:0!important;box-shadow:none!important}"],
    ["3 Hide logo", ".site-header .logo{visibility:hidden!important}"],
    ["4 Hide header buttons", ".site-header .theme-toggle,.site-header .mobile-menu,.site-header button{visibility:hidden!important}"],
    ["5 Header not positioned", ".site-header{position:static!important;z-index:auto!important}"],
    ["6 Main no overflow clip", ".neo-site{overflow:visible!important}"],
    ["7 Hide first section", "main > section:first-of-type{visibility:hidden!important}"],
    ["8 Body bg red", "html,body{background:#f88!important}"],
  ];
  var style = document.createElement("style");
  document.head.appendChild(style);
  var on = {};
  function apply() {
    style.textContent = tests.filter(function (t, i) { return on[i]; }).map(function (t) { return t[1]; }).join("\n");
  }
  function build() {
    var p = document.createElement("div");
    p.style.cssText = "position:fixed;left:6px;right:6px;bottom:6px;z-index:99999;display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#fff;border:2px solid red;border-radius:10px;font:13px system-ui";
    tests.forEach(function (t, i) {
      var b = document.createElement("button");
      b.textContent = t[0];
      b.style.cssText = "padding:8px 10px;border:1px solid #999;border-radius:8px;background:#eee;color:#000;font:inherit";
      b.onclick = function () { on[i] = !on[i]; b.style.background = on[i] ? "#ffd84d" : "#eee"; apply(); };
      p.appendChild(b);
    });
    var r = document.createElement("button");
    r.textContent = "Force repaint";
    r.style.cssText = "padding:8px 10px;border:1px solid #999;border-radius:8px;background:#cde;color:#000;font:inherit";
    r.onclick = function () {
      var h = document.documentElement; h.style.transform = "translateZ(0)";
      requestAnimationFrame(function () { requestAnimationFrame(function () { h.style.transform = ""; scrollBy(0, 1); scrollBy(0, -1); }); });
    };
    p.appendChild(r);
    document.body.appendChild(p);
  }
  if (document.readyState === "complete") build(); else addEventListener("load", build);
})();
