(function () {
  var SCHEMA_BADGES = {
    UserV1: { label: 'User', version: '2023.01.01' },
    UserV2: { label: 'User', version: '2024.06.01' },
    UserV3: { label: 'User', version: null },
  };

  var BADGE_CSS = [
    'display:inline-block',
    'padding:1px 8px',
    'border-radius:10px',
    'background:#fa8c16',
    'color:#fff',
    'font-size:11px',
    'font-weight:600',
    'font-family:sans-serif',
    'vertical-align:middle',
    'margin-left:6px',
    'line-height:1.6',
  ].join(';');

  function applyBadge(el, info) {
    el.textContent = info.label;
    if (info.version) {
      el.appendChild(document.createTextNode(' '));
      var badge = document.createElement('span');
      badge.textContent = 'Version ' + info.version;
      badge.style.cssText = BADGE_CSS;
      el.appendChild(badge);
    }
  }

  function decorate() {
    // Collapsed state: hideSelfOnExpand removes the button on expand, so when collapsed
    // the title is <span class="model model-title">{name}</span> with NO .model-title__text child.
    document.querySelectorAll('.model.model-title').forEach(function (el) {
      if (el.querySelector('.model-title__text')) return; // expanded body — handled below
      var name = el.textContent.trim();
      var info = SCHEMA_BADGES[name];
      if (info) applyBadge(el, info);
    });

    // Expanded state: the collapse button is gone (hideSelfOnExpand); the model body renders
    // <span class="model model-title"><span class="model-title__text">{name}</span></span>.
    document.querySelectorAll('.model-title__text').forEach(function (el) {
      var name = el.textContent.trim();
      var info = SCHEMA_BADGES[name];
      if (info) applyBadge(el, info);
    });
  }

  var style = document.createElement('style');
  style.textContent = '.model-box .model { margin-top: 10px; }';
  document.head.appendChild(style);

  new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
  decorate();
})();
