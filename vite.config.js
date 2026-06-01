import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/ninadate/' : '/',
  plugins: [
    {
      name: 'script-at-body-end',
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          const match = html.match(
            /<script type="module" crossorigin src="(\/ninadate\/assets\/[^"]+)"><\/script>/
          );
          if (!match) return html;
          const tag = match[0];
          return html
            .replace(tag, '')
            .replace('</body>', `    ${tag}\n  </body>`);
        },
      },
    },
  ],
}));
