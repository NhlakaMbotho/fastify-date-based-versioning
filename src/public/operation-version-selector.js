(function () {
  const CONFIG = window.__VER_CONFIG__ || {};
  const DOM = window.__SWAGGER_DOM__;
  let selectedVersions = {};

  function setSelectValue(dropDownElement, value) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    nativeSetter.call(dropDownElement, value);
    dropDownElement.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncExamples(apiRow, version) {
    for (const exSel of apiRow.querySelectorAll(DOM.swagger.examplesSelect)) {
      if (exSel.value !== version) setSelectValue(exSel, version);
    }
  }

  function injectDropdowns() {
    for (const apiRow of document.getAllAPIRows()) {
      apiRow.setAttribute(DOM.attr.processed, '1');
      const method = (apiRow.querySelector(DOM.swagger.opblockMethod) || {}).textContent || '';
      const pathEl = apiRow.querySelector(DOM.swagger.opblockPathSpan) || apiRow.querySelector(DOM.swagger.opblockPath);
      const path = pathEl ? pathEl.textContent : '';
      const key = (method.trim() + ' ' + path.trim()).trim();

      if (!CONFIG[key]?.length) {
        const badge = document.createElement('span');
        badge.textContent = 'Latest Version';
        badge.className = DOM.css.latestBadge;
        apiRow.parentNode.insertBefore(badge, apiRow);
        continue;
      }

      const versions = [...CONFIG[key]].sort((a, b) => b.localeCompare(a));

      const apiVersionDropDown = document.createElement('select');
      apiVersionDropDown.id = 'ver-sel-' + key.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
      apiVersionDropDown.className = DOM.css.selector + ' ' + DOM.css.selectorLatest;
      const latestVersionOption = document.createElement('option');
      latestVersionOption.value = '';
      latestVersionOption.textContent = 'Latest Version';
      latestVersionOption.selected = true;
      apiVersionDropDown.appendChild(latestVersionOption);
      for (const v of versions) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        apiVersionDropDown.appendChild(opt);
      }
      const warn = document.createElement('span');
      warn.textContent = 'You are using a deprecated API version.';
      warn.className = DOM.css.warn;
      apiVersionDropDown.addEventListener('change', function () {
        const isLatestVersion = apiVersionDropDown.value === '';
        apiVersionDropDown.classList.toggle(DOM.css.selectorLatest, isLatestVersion);
        apiVersionDropDown.classList.toggle(DOM.css.selectorDeprecated, !isLatestVersion);
        warn.classList.toggle(DOM.css.warnActive, !isLatestVersion);
        apiVersionDropDown.blur();
        const exVer = isLatestVersion ? versions[0] : apiVersionDropDown.value;
        selectedVersions[key] = exVer;
        syncExamples(apiRow, exVer);
      });
      new MutationObserver(function () {
        const ver = selectedVersions[key];
        if (ver) syncExamples(apiRow, ver);
      }).observe(apiRow, { childList: true, subtree: true });
      const el = document.createElement('div');
      el.className = DOM.css.selectorWrap;
      el.appendChild(apiVersionDropDown);
      el.appendChild(warn);
      apiRow.parentNode.insertBefore(el, apiRow);
    }
  }

  new MutationObserver(injectDropdowns).observe(document.documentElement, { childList: true, subtree: true });
  injectDropdowns();
})();
