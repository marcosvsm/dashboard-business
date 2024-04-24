const path = require('path');

module.exports = {
  publicPath: '/',
  lintOnSave: false,
  css: {
    loaderOptions: {
      sass: {
        sassOptions: {
          includePaths: ['node_modules', '@/assets'],
        },
      },
    },
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', path.resolve(__dirname, 'src'))
  },  
}