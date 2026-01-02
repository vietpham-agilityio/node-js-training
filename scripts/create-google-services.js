const fs = require('fs');

const base64 = process.env.GOOGLE_SERVICES_JSON;

if (!base64) {
  throw new Error('❌ GOOGLE_SERVICES_JSON is missing');
}

// ✅ Decode Base64 → JSON
// eslint-disable-next-line no-undef
const json = Buffer.from(base64, 'base64').toString('utf8');

fs.writeFileSync('google-services.json', json);

console.log('✅ google-services.json created successfully');
