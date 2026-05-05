const path = require( 'path' );
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );

module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( process.cwd(), 'src', 'index.js' ),
		'media-library': path.resolve(
			process.cwd(),
			'src',
			'media-library',
			'index.js'
		),
	},
};
