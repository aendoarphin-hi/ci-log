module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ttprod/v3/contimp'
    : '/',
  devServer: {
    proxy: 'http://localhost/ttprod/v3/contimp'
  },
  transpileDependencies: true
}
