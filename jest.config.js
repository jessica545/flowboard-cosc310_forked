module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^lucide-react$': '<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.jest.json',
    }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react).+\\.js$'
  ]
}; 