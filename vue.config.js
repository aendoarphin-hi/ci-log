module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ttprod/v3/improvement'
    : '/',
  devServer: {
    proxy: 'http://localhost/ttprod/v3/improvement'
  },
  transpileDependencies: true
}
