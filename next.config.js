const withTranspileModules = require('next-transpile-modules');
const withPlugins = require('next-compose-plugins');

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};

module.exports = withPlugins(
  [withTranspileModules(['@cloudscape-design/components'])],
  nextConfig,
);
