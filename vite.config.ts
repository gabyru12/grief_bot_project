import { defineConfig, type Plugin } from 'vite';
import path from 'node:path';
import { buildContent } from './scripts/content-lib.mjs';

// The only network rule of the game: everything comes from this site.
// When the feedback database is chosen, its address is added to connect-src.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

/** Turns content/ and customization/ into public/generated/ on every start, build and edit. */
function contentPlugin(): Plugin {
  let isBuild = false;
  return {
    name: 'icarus-content',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    async buildStart() {
      const result = await buildContent();
      if (isBuild && result.errors.length > 0) {
        this.error('The content has errors (listed above). Fix them, or run "npm run check" for the report.');
      }
    },
    configureServer(server) {
      const watched = [path.resolve('content'), path.resolve('customization')].map((p) => path.normalize(p));
      server.watcher.add(watched);
      let timer: ReturnType<typeof setTimeout> | undefined;
      server.watcher.on('all', (_event, file) => {
        const f = path.normalize(file);
        if (!watched.some((dir) => f.startsWith(dir))) return;
        clearTimeout(timer);
        timer = setTimeout(async () => {
          await buildContent();
          server.ws.send({ type: 'full-reload' });
        }, 150);
      });
    },
    transformIndexHtml(html) {
      // The CSP tag is only added to the built site; the dev server needs its own live-reload connection.
      if (!isBuild) return html;
      return html.replace('<!--CSP-->', `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [contentPlugin()],
  server: { port: 5173, strictPort: true },
});
