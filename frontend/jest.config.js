export default {
	testEnvironment: "jsdom",
	setupFiles: ["<rootDir>/jest.setup.js"],
	transform: {
	  	"^.+\\.tsx?$": "babel-jest",
	},
	moduleNameMapper: {
	  	"\\.(css|less|scss|sass)$": "identity-obj-proxy", // Mock CSS imports
		"\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/jest.mock.js" // Mock images	},
 	}
};
