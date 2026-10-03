import { cpSync, mkdirSync, rmSync } from 'node:fs';
// Publish only browser assets. Prompts, server code and business rules stay out.
rmSync('dist', { recursive: true, force: true });
mkdirSync('dist');
for (const path of ['index.html', 'experience', 'peaches', 'work', 'contact', 'assets', 'css', 'js']) {
  cpSync(path, `dist/${path}`, { recursive: true });
}
console.log('Static website built in dist/. Server code is excluded.');
