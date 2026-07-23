module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove source-map-loader rules that cause warnings from html5-qrcode
      webpackConfig.ignoreWarnings = [
        /Failed to parse source map/,
      ];
      return webpackConfig;
    },
  },
};
