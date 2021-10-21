'use strict';

const { createCSSRule } = require('rax-webpack-config');
const { WEB } = require('build-plugin-rax-app/lib/constants');

const webStandardList = [
  WEB,
];

// const inlineStandardList = [
//   WEEX, KRAKEN,
// ];

// const miniappStandardList = [
//   MINIAPP,
//   WECHAT_MINIPROGRAM,
//   BYTEDANCE_MICROAPP,
//   BAIDU_SMARTPROGRAM,
//   KUAISHOU_MINIPROGRAM,
// ];

// const nodeStandardList = [
//   DOCUMENT,
//   SSR,
// ];

function setCSSRule(config, modules, loaderOptions) {
  const cssModuleReg = /\.module\.styl$/;
  const styleReg = /\.styl$/;
  const ruleName = modules ? 'stylus-module' : 'stylus';

  try {
    if (modules) {
      createCSSRule(config, ruleName, cssModuleReg, []);
    } else {
      createCSSRule(config, ruleName, styleReg, [cssModuleReg]);
    }
  } catch (e) { // createCSSRule 内部没有做空判断
    const { taskName } = config;
    const isWebStandard = webStandardList.includes(taskName);
    const postCssType = isWebStandard ? 'web' : 'normal';

    config.module
      .rule(ruleName)
      .use('stylus-loader')
      .loader(require.resolve('stylus-loader'))
      .options({ sourceMap: true, ...loaderOptions })
      .end()
      .use('postcss-loader')
      .tap((options) => ({
        ...options,
        config: {
          path: require.resolve('build-plugin-rax-app').slice(0, -8),
          ctx: {
            type: postCssType,
          },
        },
      }));
  }
}

function prefix(arr) {
  if (Array.isArray(arr)) {
    arr.forEach((n, i) => {
      if (typeof n === 'string' && n.startsWith('~/')) {
        arr[i] = n.replace('~', process.cwd());
      }
    });
  }
}

function configure(config, loaderOptions) {
  const stylusOptions = loaderOptions && loaderOptions.stylusOptions;
  if (stylusOptions && typeof stylusOptions === 'object') {
    prefix(stylusOptions.import);
    prefix(stylusOptions.include);
    prefix(stylusOptions.use);
  }

  // 添加 css 规则
  setCSSRule(config, true, loaderOptions);
  setCSSRule(config, false, loaderOptions);
}

function plugin({ registerUserConfig, onGetWebpackConfig, context }) {
  registerUserConfig({
    name: 'stylusLoaderOptions',
    validation(value) {
      return typeof value === 'object';
    },
  });
  onGetWebpackConfig((config) => {
    configure(config, context.userConfig.stylusLoaderOptions);
  });
}

module.exports = plugin;
module.exports.configure = configure;
