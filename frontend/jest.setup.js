const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
globalThis.__API_BASE__= 'http://localhost:3000/api/v1';