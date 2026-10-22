module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/ttprod/v3/improvement'
    : '/',
  devServer: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/ttprod/v3/improvement/api'
        }
      }
    }
  },
  transpileDependencies: true
}
