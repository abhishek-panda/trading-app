const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');


module.exports = merge(common, {
	mode: 'development',
	devServer: {
		static: "./dist",
		hot: true,
		port: 9000,
		compress: true,
	},
});
