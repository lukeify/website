const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './index.js'
    },
    devServer: {
        server: 'https',
        hot: true,
        static: {
          directory: path.resolve(__dirname), // Path to your public directory
        },
        port: 8080, // Port number
        open: true, // Open the browser when server starts
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'index.html'
    })],
};
