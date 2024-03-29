const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/client.ts',
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: {
            buffer: require.resolve('buffer/'),
        },
    },
    output: {
        clean: true,
        filename: 'app.js'
    },
    devServer: {
        port: 9000
    },
    plugins: [
        new webpack.DefinePlugin({
            'SERVER_ADDRESS': JSON.stringify(process.env.SERVER_ADDRESS || 'localhost')
        }),
        new HtmlWebpackPlugin({
            template: 'public/index.html'
        })
    ],
}