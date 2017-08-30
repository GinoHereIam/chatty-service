const path = require('path');
const HtmlWPPlugin = require('html-webpack-plugin');

module.exports =  {
    entry: './app/app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
    /*externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },*/
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
            { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
        ]
    },
    plugins: [
        // new HtmlWPPlugin()
    ]
};