const path = require('path');
const HtmlWPPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: {
        app: './app/app.js'
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    /*externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },*/
    module: {
        loaders: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract('css-loader')
            },
            {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/},
            {test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/},
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWPPlugin({
            title: 'Chatty - self-hosting chat',
            template: 'template/index.ejs',
            inject: 'body'
        }),
        new ExtractTextPlugin("style.[hash].css")
    ]
};