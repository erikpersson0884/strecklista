const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.import = {
    meta: {
      env: {
        VITE_AUTH_URL: "http://mock-auth-url.com",
      },
    },
  };