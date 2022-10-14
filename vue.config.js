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
}