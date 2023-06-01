const withTranspileModules = require('next-transpile-modules');
const withPlugins = require('next-compose-plugins');

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  amp: true,
  basePath: '/pages',
};

module.exports = withPlugins(
  [withTranspileModules(['@cloudscape-design/components'])],
  nextConfig,
);

module.exports = {
  i18n: {
    locales: ['en', 'fr', 'de'],
    defaultLocale: 'en',
  },
};
