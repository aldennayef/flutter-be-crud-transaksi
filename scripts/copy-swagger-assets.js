
import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve('node_modules/swagger-ui-dist');
const destination = path.resolve('public/api-docs');

if (!fs.existsSync(source)) {
  throw new Error('Folder swagger-ui-dist tidak ditemukan');
}

fs.mkdirSync(destination, { recursive: true });

fs.cpSync(source, destination, {
  recursive: true,
  force: true,
});

console.log('Swagger UI assets berhasil disalin ke public/api-docs');
