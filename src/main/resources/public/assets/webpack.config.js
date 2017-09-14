const path = require('path');
const HtmlWPPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './app/app.js'
    },
    output: {
        filename: '[name].[hash].js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    devServer: {
        contentBase: './dist',
        inline: true,
        port: 8081,
        host: 'localhost'
    },
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
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    cacheDirectory: true,
                }
            },
            {test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/},
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: 'file-loader?name=fonts/[name].[ext]'
            }
        ]
    },
    plugins: [
        new HtmlWPPlugin({
            title: 'Chatty - self-hosting chat',
            template: 'template/index.ejs',
            inject: 'body'
        }),
        new ExtractTextPlugin("style.[hash].css"),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'main',
            async: true
        })
    ]
};