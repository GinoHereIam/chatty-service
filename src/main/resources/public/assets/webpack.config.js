// webpack v4
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: './app/app.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[hash].js'
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        inline: true,
        port: 8081,
        host: '0.0.0.0'
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            {
                test: /\.less$/,
                use: [{
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'less-loader'
                    }
                ]
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin('dist', {}),
        // new MiniCssExtractPlugin({
        //     filename: 'style.[contenthash].css'
        // }),
        new HtmlWebpackPlugin({
            title: 'Chatty - self-hosting chat',
            template: './template/index.ejs',
            inject: 'body'
        }),
        new WebpackMd5Hash()
        // new StyleLintPlugin({
        //     configFile: './stylelint.config.js',
        //     files: './src/less/*.less',
        //     syntax: 'less'
        // })
    ]
};