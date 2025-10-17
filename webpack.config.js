const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './index.js'
    },
    output: {
        filename: '[name].bundle.js',
    },
    devServer: {
        server: 'https',
        static: {
          directory: path.resolve(__dirname),
        },
        port: 8080,
        open: true,
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'index.html'
    })],
};
