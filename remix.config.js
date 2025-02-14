/** @type {import('@remix-run/dev').AppConfig} */
const { createRoutesFromFolders } = require('@remix-run/v1-route-convention');

module.exports = {
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true,
    v3_relativeSplatPath: true,
  },
  ignoredRouteFiles: ['**/.*'],
  serverModuleFormat: 'cjs',
  appDirectory: 'app',
  assetsBuildDirectory: 'public/build',
  serverBuildPath: 'build/index.js',
  publicPath: '/build/',

  routes(defineRoutes) {
    // uses the v1 convention, works in v1.15+ and v2
    return createRoutesFromFolders(defineRoutes);
  },
};
