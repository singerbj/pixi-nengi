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
    },
    output: {
        clean: true,
        filename: 'app.js'
    },
    devServer: {
        port: 9000
    },
}