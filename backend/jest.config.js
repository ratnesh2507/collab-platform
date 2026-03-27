export default {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^../generated/prisma/client$": "<rootDir>/src/__mocks__/prisma-client.ts",
    "^../../generated/prisma/client$":
      "<rootDir>/src/__mocks__/prisma-client.ts",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      { useESM: false, tsconfig: { module: "commonjs" } },
    ],
  },
};
