// Central registry of Swagger UI DOM selectors and our own CSS class names.
// ─── swagger ─────────────────────────────────────────────────────────────────
//   Selectors that target Swagger UI's internal markup.
//   If @fastify/swagger-ui upgrades and renames these, update here only.
// ─── css ─────────────────────────────────────────────────────────────────────
//   Class names defined in swagger-extensions.css.
//   If you rename a class in the CSS file, update here only.
// ─── attr ────────────────────────────────────────────────────────────────────
//   Data attributes we write onto DOM nodes to track internal state.
window.__SWAGGER_DOM__ = {
  swagger: {
    opblock:             '.opblock',
    opblockMethod:       '.opblock-summary-method',
    opblockPathSpan:     '.opblock-summary-path span',
    opblockPath:         '.opblock-summary-path',
    examplesSelect:      '.examples-select select',
    modelTitle:          '.model.model-title',
    modelTitleExpanded:  '.model-title__text',
  },
  css: {
    latestBadge:         'ver-latest-badge',
    selector:            'ver-selector',
    selectorWrap:        'ver-selector-wrap',
    selectorLatest:      'latest',
    selectorDeprecated:  'deprecated',
    warn:                'ver-warn',
    warnActive:          'active',
    schemaBadge:         'ver-schema-badge',
  },
  attr: {
    processed: 'data-ver-btn',
  },
};

// Returns all API row elements that have not yet been processed.
Document.prototype.getAllAPIRows = function () {
  const dom = window.__SWAGGER_DOM__;
  return Array.from(
    this.querySelectorAll(dom.swagger.opblock + ':not([' + dom.attr.processed + '])')
  );
};