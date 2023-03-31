const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = {
	entry: {
		main: path.resolve(__dirname, "index.tsx")
	},
	output: {
		path: path.resolve(__dirname, ".." ,"public"),
		filename: "[name].[contenthash].js",
		clean: true,
	},
	module: {
		rules: [
			{
				test: /\.ts(x)?$/,
				loader: "ts-loader",
				options: {
					configFile: path.resolve(__dirname, "tsconfig.json")
				},
			},
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
				exclude: [
					/server/,
					/build/,
					/public/
				],
			},
			{
				test: /\.hbs$/,
				loader: 'handlebars-loader',
				exclude: [
					/node_modules/,
					/server/,
					/build/,
					/public/
				],
			},
			{
				test: /\.(png|jpg|gif|svg|json)$/i,
				type: 'asset/resource'
			}
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Abhishek Panda - Home',
			filename: 'index.html',
			template: path.resolve(__dirname, 'templates', 'index.hbs')
		}),
		new MiniCssExtractPlugin(),
		// new BundleAnalyzerPlugin()
	]
};

module.exports = config;
