const { TextEncoder, TextDecoder } = require('util');

// Add to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.__API_BASE__ = 'http://localhost:3000/api/v1';
