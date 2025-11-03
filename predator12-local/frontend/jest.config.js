// Jest Configuration для React Компонентів Predator12
// Налаштування для Unit та Integration тестів

module.exports = {
    displayName: "frontend-tests",
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
    
    // Module resolution
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "\\.(gif|ttf|eot|svg|png|jpg|jpeg)$": "<rootDir>/src/__mocks__/fileMock.js",
    },
    
    // Setup files
    setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
    
    // Transform files
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {
            tsconfig: {
                jsx: "react-jsx",
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        }],
    },
    
    // Coverage
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/*.d.ts",
        "!src/index.tsx",
        "!src/reportWebVitals.ts",
    ],
    
    coverageThresholds: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
    
    // Globals
    globals: {
        "ts-jest": {
            isolatedModules: true,
        },
    },
}

