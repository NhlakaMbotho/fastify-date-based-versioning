(function () {
  var CONFIG = window.__VER_CONFIG__ || {};
  var selectedVersions = {};

  // Hide Swagger UI's built-in example dropdowns — the version selector above drives them
  var style = document.createElement('style');
  style.textContent = '.examples-select { display: none !important; }';
  document.head.appendChild(style);

  function arrowBg(color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="' + color + '" d="M5 8l5 5 5-5z"/></svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '") center right 8px / 12px no-repeat #f7f7f7';
  }

  function applyColor(el, color) {
    el.style.borderColor = color;
    el.style.color = color;
    el.style.background = arrowBg(color);
  }

  function fitWidth(sel) {
    var ctx = document.createElement('canvas').getContext('2d');
    ctx.font = '14px Arial, sans-serif';
    var max = 0;
    for (var i = 0; i < sel.options.length; i++) {
      var w = ctx.measureText(sel.options[i].text).width;
      if (w > max) max = w;
    }
    sel.style.width = (Math.ceil(max) + 60) + 'px';
  }

  function setSelectValue(sel, value) {
    var nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    nativeSetter.call(sel, value);
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncExamples(opblock, version) {
    opblock.querySelectorAll('.examples-select select').forEach(function (exSel) {
      if (exSel.value !== version) setSelectValue(exSel, version);
    });
  }

  function injectDropdowns() {
    document.querySelectorAll('.opblock:not([data-ver-btn])').forEach(function (opblock) {
      opblock.setAttribute('data-ver-btn', '1');
      var method = (opblock.querySelector('.opblock-summary-method') || {}).textContent || '';
      var pathEl = opblock.querySelector('.opblock-summary-path span') || opblock.querySelector('.opblock-summary-path');
      var path = pathEl ? pathEl.textContent : '';
      var key = (method.trim() + ' ' + path.trim()).trim();
      var versions = CONFIG[key] || [];
      var el;
      if (versions.length === 0) {
        el = document.createElement('span');
        el.textContent = 'Latest Version';
        el.style.cssText = 'display:inline-block;margin-bottom:6px;padding:5px 10px;background:#52c41a;color:#fff;border-radius:4px;font-size:14px;font-weight:700;font-family:sans-serif;opacity:0.4;vertical-align:middle;width:150px;text-align:center';
      } else {
        var sel = document.createElement('select');
        sel.id = 'ver-sel-' + key.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
        sel.style.cssText = 'display:inline-block;text-align:center;';
        var latest = document.createElement('option');
        latest.value = '';
        latest.textContent = 'Latest Version';
        latest.selected = true;
        sel.appendChild(latest);
        versions.forEach(function (v) {
          var opt = document.createElement('option');
          opt.value = v;
          opt.textContent = v;
          sel.appendChild(opt);
        });
        fitWidth(sel);
        var warn = document.createElement('span');
        warn.textContent = 'You are using a deprecated API version.';
        warn.style.cssText = 'display:none;margin-left:10px;color:#fa8c16;font-size:12px;font-family:sans-serif;vertical-align:middle;';
        applyColor(sel, '#52c41a');
        sel.addEventListener('change', function () {
          var isLatest = sel.value === '';
          applyColor(sel, isLatest ? '#52c41a' : '#fa8c16');
          warn.style.display = isLatest ? 'none' : 'inline';
          sel.blur();
          // When "Latest", point examples at the most recent version
          var exVer = isLatest ? versions[versions.length - 1] : sel.value;
          selectedVersions[key] = exVer;
          syncExamples(opblock, exVer);
        });
        // Re-sync when example dropdowns appear (expand / Try it out)
        new MutationObserver(function () {
          var ver = selectedVersions[key];
          if (ver) syncExamples(opblock, ver);
        }).observe(opblock, { childList: true, subtree: true });
        el = document.createElement('div');
        el.style.cssText = 'margin-bottom:6px;';
        el.appendChild(sel);
        el.appendChild(warn);
      }
      opblock.parentNode.insertBefore(el, opblock);
    });
  }

  new MutationObserver(injectDropdowns).observe(document.documentElement, { childList: true, subtree: true });
  injectDropdowns();
})();
