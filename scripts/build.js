import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const srcDir = path.join(rootDir, 'src');

console.log('Building dist package...');

// 1. Clean and recreate the dist directory
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy compiled/source files into dist/
fs.cpSync(srcDir, distDir, { recursive: true });

// 3. Copy essential metadata files from root to dist/
const filesToCopy = ['README.md', 'LICENSE'];
for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
  }
}

// 4. Prepare and rewrite package.json for dist
const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  // Strip scripts so consumers don't get internal build/test scripts
  delete pkg.scripts;
  delete pkg.files;

  // Replace src/ with empty string
  const distPkgContent = JSON.stringify(pkg, null, 2).replaceAll('src/', '') + '\n';

  // Write out the tailored package.json to dist/
  fs.writeFileSync(
    path.join(distDir, 'package.json'),
    distPkgContent,
    'utf8'
  );
}

console.log('Successfully built and prepared ./dist for publishing!');
