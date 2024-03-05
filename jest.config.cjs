const config = require('@blastz/jest').getJestConfig();

module.exports = {
  ...config,
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '^@libs/pkgx-plugin-devkit$': '<rootDir>/libs/pkgx-plugin-devkit/src',
  },
};
