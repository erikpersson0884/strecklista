export default {
	testEnvironment: "jsdom",
	setupFiles: ["<rootDir>/jest.setup.js"],
	transform: {
	  "^.+\\.tsx?$": "babel-jest",
	},
	moduleNameMapper: {
	  "\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
	},
	
 };
 