export default {
  rootDir: "../",
  testEnvironment: "jsdom",
  setupFiles: [
	"<rootDir>/jest/jest.setup.js",
	"<rootDir>/jest/jest.mock.js"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
    "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/jest/jest.mock.js", // Mock images
    "^@/contexts/(.*)$": "<rootDir>/src/contexts/$1",
  },
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.test.json", // point to your test tsconfig if you have one
      // You can add more ts-jest options here if needed
    },
  },
};
