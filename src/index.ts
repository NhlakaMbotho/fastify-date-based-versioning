import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { userRoutes } from './routes/users'

const app = Fastify({ logger: true })

app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Users API',
      description: 'Date-based header versioning. Send `Accept-Version: YYYY.MM.DD` to pin to a release.',
      version: '1.0.0',
    },
    tags: [
      { name: 'Users', description: 'User management endpoints.' },
    ],
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    tryItOutEnabled: true,
    requestInterceptor: (request: any) => {
      const version = (window as any).__apiVersion
      if (version) request.headers['Accept-Version'] = version
      return request
    },
  },
  theme: {
    css: [
      {
        filename: 'version-badges.css',
        content: `
          #version-selector-wrapper {
            display: flex; align-items: center; gap: 10px;
            margin-left: auto; padding-right: 20px;
          }
          #version-selector-wrapper label {
            color: #fff; font-size: 13px; font-weight: 600;
            font-family: sans-serif; white-space: nowrap;
          }
          #api-version-select {
            padding: 5px 12px; border-radius: 20px; border: none;
            font-size: 13px; font-weight: 600; cursor: pointer;
            background: #fff; color: #3b4151; outline: none;
          }
          .version-badge {
            display: inline-block; padding: 3px 10px;
            border-radius: 20px; font-size: 11px; font-weight: 700;
            font-family: sans-serif; color: #fff; vertical-align: middle;
          }
          .version-badge.v1 { background: #49cc90; }
          .version-badge.v2 { background: #61affe; }
          .version-badge.v3 { background: #f93e3e; }
        `,
      },
    ],
    js: [
      {
        filename: 'version-selector.js',
        content: `
          (function () {
            var VERSIONS = [
              { value: '',           label: 'Default (earliest)',        badge: null },
              { value: '2023.01.01', label: '2023.01.01 — v1 initial',   badge: { cls: 'v1', text: 'v1' } },
              { value: '2024.06.01', label: '2024.06.01 — v2 name split',badge: { cls: 'v2', text: 'v2' } },
              { value: '2025.03.01', label: '2025.03.01 — v3 + address', badge: { cls: 'v3', text: 'v3' } },
            ];

            function inject() {
              var topbar = document.querySelector('.topbar-wrapper');
              if (!topbar || document.getElementById('version-selector-wrapper')) return;

              var wrapper = document.createElement('div');
              wrapper.id = 'version-selector-wrapper';

              var label = document.createElement('label');
              label.textContent = 'Accept-Version:';
              label.setAttribute('for', 'api-version-select');

              var select = document.createElement('select');
              select.id = 'api-version-select';
              VERSIONS.forEach(function (v) {
                var opt = document.createElement('option');
                opt.value = v.value;
                opt.textContent = v.label;
                select.appendChild(opt);
              });

              var badge = document.createElement('span');
              badge.id = 'version-active-badge';
              badge.className = 'version-badge';
              badge.style.display = 'none';

              select.addEventListener('change', function () {
                var chosen = VERSIONS.find(function (v) { return v.value === select.value; });
                window.__apiVersion = select.value || null;
                if (chosen && chosen.badge) {
                  badge.className = 'version-badge ' + chosen.badge.cls;
                  badge.textContent = chosen.badge.text;
                  badge.style.display = 'inline-block';
                } else {
                  badge.style.display = 'none';
                }
              });

              wrapper.appendChild(label);
              wrapper.appendChild(select);
              wrapper.appendChild(badge);
              topbar.appendChild(wrapper);
            }

            var attempts = 0;
            var interval = setInterval(function () {
              inject();
              if (document.getElementById('version-selector-wrapper') || ++attempts > 50) {
                clearInterval(interval);
              }
            }, 100);
          })();
        `,
      },
    ],
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
