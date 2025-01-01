import 'tsconfig-paths/register';
import { pathsToModuleNameMapper, JestConfigWithTsJest } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const jestConfig: JestConfigWithTsJest = {
  testEnvironment: "node",
  preset: "ts-jest",
  clearMocks: true,
  forceExit: false,
  collectCoverage: true,
  verbose: true,
  rootDir: ".",
  collectCoverageFrom: ["<rootDir>/src/api/**/*.ts"],
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: ["**/**/*.test.ts", "**/**/*.spec.ts"],
  moduleNameMapper: {
    "^@/api/(.*)$": ["<rootDir>/src/api/$1"],
    "^@/db/(.*)$": ["<rootDir>/src/api/db/$1"],
    "^@/helpers/(.*)$": ["<rootDir>/src/api/helpers/$1"],
    "^@/controllers/(.*)$": ["<rootDir>/src/api/controllers/$1"],
    "^@/routes/(.*)$": ["<rootDir>/src/api/routes/$1"],
    "^@/services/(.*)$": ["<rootDir>/src/api/services/$1"],
    "^@/schemas/(.*)$": ["<rootDir>/src/api/helpers/schemas/$1"],
    "^@/configs/(.*)$": ["<rootDir>/src/api/helpers/configs/$1"],
    "^@/DTO/(.*)$": ["<rootDir>/src/api/helpers/DTO/$1"],
    "^@/enum/(.*)$": ["<rootDir>/src/api/helpers/enum/$1"],
    "^@/interfaces/(.*)$": ["<rootDir>/src/api/helpers/interfaces/$1"],
    "^@/lib/(.*)$": ["<rootDir>/src/api/helpers/lib/$1"],
    "^@/middlewares/(.*)$": ["<rootDir>/src/api/helpers/middlewares/$1"],
    "^@/utils/(.*)$": ["<rootDir>/src/api/helpers/utils/$1"],
    "^@/__test__/(.*)$": ["<rootDir>/src/__tests__/$1"],
    "^@/integrations/(.*)$": ["<rootDir>/src/api/helpers/integrations/$1"],
    "^@/types/(.*)$": ["<rootDir>/src/api/types/$1"],
    "^@/queues/(.*)$": ["<rootDir>/src/api/helpers/queues/$1"],
    "^@/(.*)$": ["<rootDir>/src/$1"],
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup-redis.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testPathIgnorePatterns: ['./node_modules/', './.dist/', './dist', './.vscode'],
};

export default jestConfig;