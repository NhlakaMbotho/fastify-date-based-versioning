import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { userRoutes } from './routes/users'

const app = Fastify({ logger: true })

// Maps "METHOD /path" (OpenAPI format) → date versions that support it.
// Update this whenever a new version adds or removes an endpoint.
const VERSION_CONFIG: Record<string, string[]> = {
  'GET /api/users': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'POST /api/users': [],
  'PATCH /api/users/{id}': ['2023.01.01', '2024.06.01', '2025.03.01'],
  'DELETE /api/users/{id}': [],
}

const EXAMPLES_CONFIG: Record<string, Record<string, { response?: unknown; request?: unknown }>> = {
  'GET /api/users': {
    '2023.01.01': { response: [{ id: 'string', name: 'string', email: 'user@example.com' }] },
    '2024.06.01': { response: [{ id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com' }] },
    '2025.03.01': { response: [{ id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } }] },
  },
  'PATCH /api/users/{id}': {
    '2023.01.01': {
      request: { name: 'string', email: 'user@example.com' },
      response: { id: 'string', name: 'string', email: 'user@example.com' },
    },
    '2024.06.01': {
      request: { firstName: 'string', lastName: 'string', email: 'user@example.com' },
      response: { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com' },
    },
    '2025.03.01': {
      request: { firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } },
      response: { id: 'string', firstName: 'string', lastName: 'string', email: 'user@example.com', address: { street: 'string', city: 'string', country: 'string' } },
    },
  },
}

app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Users API',
      version: '1.0.0',
    },
    tags: [
      { name: 'Users', description: 'User management endpoints.' },
    ],
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
  theme: {
    js: [
      {
        filename: 'custom-version-btn.js',
        content: `
          (function () {
            var CONFIG = ${JSON.stringify(VERSION_CONFIG)};
            var EXAMPLES = ${JSON.stringify(EXAMPLES_CONFIG)};
            var savedContents = new WeakMap();
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
              sel.style.width = '160px';
            }
            function escHtml(s) {
              return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            function renderExample(opblock, version) {
              var key = opblock.getAttribute('data-ver-key');
              var examples = key && EXAMPLES[key];
              var versionEx = (version && examples) ? examples[version] : null;
              opblock.querySelectorAll('.highlight-code').forEach(function (c) {
                if (!savedContents.has(c)) {
                  savedContents.set(c, c.innerHTML);
                }
                if (!versionEx) {
                  c.innerHTML = savedContents.get(c);
                  return;
                }
                var isResponse = !!c.closest('.responses-wrapper');
                var data = isResponse ? versionEx.response : versionEx.request;
                if (data === undefined) {
                  c.innerHTML = savedContents.get(c);
                  return;
                }
                c.innerHTML = '<pre style="padding:10px;margin:0;color:#e6edf3;background:#1f2329;font-size:12px;font-family:monospace;white-space:pre-wrap;">' +
                  escHtml(JSON.stringify(data, null, 2)) + '</pre>';
              });
            }
            function injectDropdowns() {
              document.querySelectorAll('.opblock:not([data-ver-btn])').forEach(function (opblock) {
                opblock.setAttribute('data-ver-btn', '1');
                var method = (opblock.querySelector('.opblock-summary-method') || {}).textContent || '';
                var pathEl = opblock.querySelector('.opblock-summary-path span') || opblock.querySelector('.opblock-summary-path');
                var path = pathEl ? pathEl.textContent : '';
                var key = (method.trim() + ' ' + path.trim()).trim();
                opblock.setAttribute('data-ver-key', key);
                var versions = CONFIG[key] || [];
                var el;
                if (versions.length === 0) {
                  el = document.createElement('span');
                  el.textContent = 'Latest Version';
                  el.style.cssText = 'display:inline-block;margin-bottom:6px;padding:5px 10px;background:#52c41a;color:#fff;border-radius:4px;font-size:14px;font-weight:700;font-family:sans-serif;opacity:0.4;vertical-align:middle;width:160px;text-align:center';
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
                    if (isLatest) {
                      opblock.removeAttribute('data-ver-selected');
                    } else {
                      opblock.setAttribute('data-ver-selected', sel.value);
                    }
                    renderExample(opblock, isLatest ? null : sel.value);
                    sel.blur();
                  });
                  el = document.createElement('div');
                  el.style.cssText = 'margin-bottom:6px;';
                  el.appendChild(sel);
                  el.appendChild(warn);
                }
                opblock.parentNode.insertBefore(el, opblock);
              });
              requestAnimationFrame(function () {
                document.querySelectorAll('.opblock[data-ver-selected]').forEach(function (opblock) {
                  renderExample(opblock, opblock.getAttribute('data-ver-selected'));
                });
              });
            }
            new MutationObserver(injectDropdowns).observe(document.documentElement, { childList: true, subtree: true });
            injectDropdowns();
          })();
        `,
      },
    ],
  },
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    tryItOutEnabled: true,
  },
})

app.register(userRoutes)

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`
  ┌──────────────────────────────────────────┐
  │  Users API  →  http://localhost:3000     │
  │  Docs       →  http://localhost:3000/docs│
  │                                          │
  │  GET    /api/users                       │
  │  POST   /api/users                       │
  │  PATCH  /api/users/:id                   │
  │  DELETE /api/users/:id                   │
  │  Accept-Version: 2023.01.01              │
  │                   2024.06.01             │
  │                   2025.03.01             │
  └──────────────────────────────────────────┘
  `)
})
