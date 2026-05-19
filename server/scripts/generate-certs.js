import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import selfsigned from 'selfsigned';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certsDir = path.join(__dirname, '..', 'certs');

const serverIp = process.env.SERVER_IP || 'localhost';

const altNames = [
  { type: 2, value: 'localhost' },
  { type: 2, value: 'fittrack.local' },
  { type: 7, ip: '127.0.0.1' },
];

if (serverIp !== 'localhost') {
  altNames.push({ type: 7, ip: serverIp });
}

const attrs = [{ name: 'commonName', value: 'FitTrack Dev' }];
const pems = await selfsigned.generate(attrs, {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [{ name: 'subjectAltName', altNames }],
});

if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

fs.writeFileSync(path.join(certsDir, 'key.pem'), pems.private);
fs.writeFileSync(path.join(certsDir, 'cert.pem'), pems.cert);

console.log(`Certificates written to ${certsDir}`);
console.log(`SAN includes: localhost, 127.0.0.1${serverIp !== 'localhost' ? `, ${serverIp}` : ''}`);
console.log('Regenerate with: SERVER_IP=<your-lan-ip> npm run generate-certs');
