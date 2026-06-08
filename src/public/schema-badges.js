(function () {
  // Build inverse of __VERSION_INDEX_MAP__: version number → release date.
  // e.g. { 1: '2023.01.01', 2: '2024.06.01', 3: '2025.03.01' }
  var indexToDate = {};
  var versionIndexMap = window.__VERSION_INDEX_MAP__ || {};
  Object.keys(versionIndexMap).forEach(function (date) {
    indexToDate[versionIndexMap[date]] = date;
  });

  // Resolve any schema name that follows the EntityV{n} convention.
  // e.g. 'UserV2' → { label: 'User', version: '2024.06.01' }
  // Returns null for names that don't match (e.g. 'Address').
  function getBadgeInfo(schemaName) {
    var match = schemaName.match(/^(.+)V(\d+)$/);
    if (!match) return null;
    var label = match[1];
    var vIndex = parseInt(match[2], 10);
    return { label: label, version: indexToDate[vIndex] || null };
  }

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
    // Collapsed state: title is <span class="model model-title">{name}</span>
    document.querySelectorAll('.model.model-title').forEach(function (el) {
      if (el.querySelector('.model-title__text')) return; // expanded — handled below
      var info = getBadgeInfo(el.textContent.trim());
      if (info) applyBadge(el, info);
    });

    // Expanded state: <span class="model-title__text">{name}</span>
    document.querySelectorAll('.model-title__text').forEach(function (el) {
      var info = getBadgeInfo(el.textContent.trim());
      if (info) applyBadge(el, info);
    });
  }

  var style = document.createElement('style');
  style.textContent = '.model-box .model { margin-top: 10px; }';
  document.head.appendChild(style);

  new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
  decorate();
})();
