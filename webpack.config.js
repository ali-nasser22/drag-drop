const path = require('path');

module.exports = {
    entry: './src/script.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname,'dist'),
        publicPath: '/dist/'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.ts$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname),
            },
        ],
    },
    mode: "development",
    optimization: {
        minimize: true,
    }


}