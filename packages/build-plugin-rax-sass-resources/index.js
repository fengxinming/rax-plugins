'use strict';

module.exports = ({ onGetWebpackConfig }, opts) => {
  onGetWebpackConfig((config) => {
    ['scss', 'scss-module'].forEach((key) => {
      config.module.rule(key)
        .use('sass-resources-loader')
        .loader(require.resolve('sass-resources-loader'))
        .options(opts);
    });
  });
};
