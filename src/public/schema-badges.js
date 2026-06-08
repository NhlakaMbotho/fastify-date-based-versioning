(function () {
  const DOM = window.__SWAGGER_DOM__;

  // Build inverse of __VERSION_INDEX_MAP__: version number → release date.
  // e.g. { 1: '2023.01.01', 2: '2024.06.01', 3: '2025.03.01' }
  const indexToDate = {};
  const versionIndexMap = window.__VERSION_INDEX_MAP__ || {};
  Object.keys(versionIndexMap).forEach(function (date) {
    indexToDate[versionIndexMap[date]] = date;
  });
  const latestIndex = Math.max(...Object.keys(indexToDate).map(Number));

  // Resolve any schema name that follows the EntityV{n} convention.
  // e.g. 'UserV2' → { label: 'User', version: '2024.06.01' }
  // e.g. 'UserV3' (latest) → { label: 'User', version: null }  — omitted, same as dropdown
  // Returns null for names that don't match (e.g. 'Address').
  function getBadgeInfo(schemaName) {
    const match = schemaName.match(/^(.+)V(\d+)$/);
    if (!match) return null;
    const label = match[1];
    const vIndex = parseInt(match[2], 10);
    const version = vIndex === latestIndex ? null : (indexToDate[vIndex] || null);
    return { label: label, version: version };
  }

  function applyBadge(el, info) {
    el.textContent = info.label;
    if (info.version) {
      el.appendChild(document.createTextNode(' '));
      const badge = document.createElement('span');
      badge.textContent = 'Version ' + info.version;
      badge.className = DOM.css.schemaBadge;
      el.appendChild(badge);
    }
  }

  function decorate() {
    // Collapsed state: title is <span class="model model-title">{name}</span>
    document.querySelectorAll(DOM.swagger.modelTitle).forEach(function (modelElement) {
      if (modelElement.querySelector(DOM.swagger.modelTitleExpanded)) return; // expanded — handled below
      const info = getBadgeInfo(modelElement.textContent.trim());
      if (info) applyBadge(modelElement, info);
    });

    // Expanded state: <span class="model-title__text">{name}</span>
    document.querySelectorAll(DOM.swagger.modelTitleExpanded).forEach(function (modelElement) {
      const info = getBadgeInfo(modelElement.textContent.trim());
      if (info) applyBadge(modelElement, info);
    });
  }

  new MutationObserver(decorate).observe(document.documentElement, { childList: true, subtree: true });
  decorate();
})();
