'use strict';

let
	path = require('path'),
	webpack = require('webpack'),

	config = require(path.posix.resolve('./src/server/config.js')),
	assets = require(path.posix.resolve('./config/assets.js'));

module.exports = (mode) => {

	/**
	 * Flags to determine the mode in which we're invoking webpack
	 *
	 *  'build' - Building the production JS
	 *  'develop' - Running webpack dev middleware for development
	 *  'test' - Running webpack for executing tests
	 */
	const build = (mode === 'build');
	const develop = (mode === 'develop');
	const test = mode.startsWith('test');
	const coverage = mode.includes(':coverage');


	// The main webpack config object to return
	let wpConfig = {};


	/**
	 * Source map configuration
	 */
	if(build) {
		// Disable sourcemaps for prod build since they don't work anyways
		wpConfig.devtool = false;
	}
	else if(test) {
		// Inline sourcemaps required for coverage to work
		wpConfig.devtool = 'inline-source-map';
	}
	else {
		// Eval source maps for development (provides trace back to original TS)
		wpConfig.devtool = 'eval-source-map';
	}


	/**
	 * Entry points for the program
	 *
	 *   'vendor' - All third-party dependencies of the application
	 *   'application' - Application code
	 */
	wpConfig.entry = (test)? {
		application: path.posix.resolve('./src/client/main.ts')
	} : {
		application: path.posix.resolve('./src/client/main.ts'),
		vendor: path.posix.resolve('./src/client/vendor.ts')
	};


	/**
	 * Bundle output definitions
	 *   Defines how output bundles are generated and named
	 */
	wpConfig.output = {};

	// If build mode set up for static loading of resources with cache busting
	if(build) {
		wpConfig.output.path = path.posix.resolve('./public');
		wpConfig.output.publicPath = '/';
		wpConfig.output.filename = '[name].[chunkhash].js';
		wpConfig.output.chunkFilename = '[id].[chunkhash].chunk.js';
	}
	// If develop mode, set up for dev middleware
	else if(develop) {
		wpConfig.output.path = path.posix.resolve('./public');
		wpConfig.output.publicPath= `${config.app.url.protocol}://${config.app.url.host}:${config.devPorts.webpack}/dev/`;
		wpConfig.output.filename = '[name].js';
		wpConfig.output.chunkFilename = '[name].js';
	}


	/**
	 * List of extensions that webpack should try to resolve
	 */
	wpConfig.resolve = {
		extensions: [
			'.ts', '.js','.json',
			'.woff', '.woff2', '.ttf', '.eot', '.svg',
			'.css', '.scss',
			'.html'
		]
	};

	/**
	 * Module Loaders for webpack
	 *   Teach webpack how to read various types of referenced dependencies
	 */
	wpConfig.module = {

		// Configured loaders
		loaders: [

			// Typescript loader
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				options: {
					configFileName: path.posix.resolve('./tsconfig.json')
				}
			},

			{
				test: /\.ts$/,
				loader: 'angular2-template-loader'
			},

			// CSS loader
			{ test: /\.css$/, loaders: [ 'style-loader?insertAt=top', 'css-loader' ] },

			// SCSS loader
			{ test: /\.scss$/, loaders: [ 'style-loader?insertAt=top', 'css-loader', 'sass-loader' ] },

			// Image file loader
			{ test: /\.png$/, loader: 'url-loader?limit=10000&mimetype=image/png' },
			{ test: /\.(gif|jpg|jpeg)$/, loader: 'file-loader' },

			// Font file loader (mostly for bootstrap/font-awesome)
			{ test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },

			// Font file loader (mostly for bootstrap/font-awesome)
			{ test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/, loader: 'file-loader' },

			// HTML file loader (for angular2 templates)
			{ test: /\.html$/, loader: 'html-loader' }
		]

	};

	if (develop) {
		wpConfig.module.loaders.push({
			test: /node_modules\/@asymmetrik.*\.js$/,
			loader: 'source-map-loader',
			enforce: 'pre'
		});
	}


	/**
	 * Webpack plugins
	 */
	wpConfig.plugins = [];

	if(build) {
		// Minify if we're in build mode
		wpConfig.plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				minimize: true,
				sourceMap: false,
				output: {
					// Only comments matching this regex will be preserved
					comments: /@license/
				},
				compress: {
					// Don't show js warnings
					warnings: false
				}
			})
		);

		// Add a banner if we're in build mode
		wpConfig.plugins.push(new webpack.BannerPlugin(
			{ banner: assets.bannerString, raw: true, entryOnly: false }
		));
	}

	wpConfig.plugins.push(
		new webpack.ProvidePlugin({
			d3: 'd3'
		}),
		new webpack.ContextReplacementPlugin(
			/angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/
		)
	);

	// Chunk common code if we're not running in test mode
	if(!test) {
		wpConfig.plugins.push(
			new webpack.optimize.CommonsChunkPlugin({
				name: [ 'application', 'vendor' ],
				filename: (build) ? '[name].[chunkhash].js' : '[name].js'
			})
		);
	}

	if(coverage) {
		wpConfig.module.loaders.push({
			test: /\.(js|ts)$/,
			loader: 'sourcemap-istanbul-instrumenter-loader?force-sourcemap=true',
			enforce: 'post',
			exclude: [
				/\.spec.ts$/,
				/node_modules/
			]
		});
	}

	return wpConfig;
};
