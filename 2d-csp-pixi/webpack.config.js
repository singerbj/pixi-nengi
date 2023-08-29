module.exports = {
    mode: 'development',
    entry: './src/client/client-main.ts',
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