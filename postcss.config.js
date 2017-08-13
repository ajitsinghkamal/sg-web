module.exports = {
	plugins: [
        require('postcss-import')(),
        require('postcss-nested')(),
		require('cssnano'),
		require('autoprefixer'),
		require('postcss-simple-vars')(),
	]

}