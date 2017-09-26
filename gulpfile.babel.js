/* eslint-disable arrow-body-style */
/* eslint-disable no-param-reassign */

/**
 * dependencies
 */

// ==================== Gulp ==========================
const gulp = require('gulp');
const map = require('gulp-sourcemaps');
const tap = require('gulp-tap');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');

// =================== Browserify =====================
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('gulp-buffer');

// =================== Server ========================= 
const superstatic = require('superstatic');
const browserSync = require('browser-sync').create();

// ================== Dev =============================
const postcss = require('gulp-postcss');
const htmlmin = require('gulp-htmlmin');
const critical = require('critical').stream;

const vendors = ['jquery', 'firebase', 'slick-carousel', 'handlebars', 'vanilla-lazyload'];


/**
 * reloads browser
 * 
 * @param {any} done 
 */
function reload(done) {
	browserSync.reload();
	done();
}

/**
 * compile postcss and minify it
 */
gulp.task('css', () => {
	return gulp.src('src/styles.css')
		.pipe(map.init())
		.pipe(postcss())
		.pipe(map.write('./maps'))
		.pipe(gulp.dest('public/'))
		.pipe(browserSync.stream());
});

/**
 * css task watcher
 */
gulp.task('watchCss', ['css']);

/**
 * compile es6 to legacy js and uglify it
 */
gulp.task('compile', () => {
	// const tasks = scripts.map((entry) => {
	// 	return browserify({
	// 		entries: [entry],
	// 		debug: true,
	// 	})

	return gulp.src('src/scripts/*.js', { read: false })
		.pipe(tap((file) => {
			file.contents = browserify(file.path, { debug: true })
				.external(vendors)
				.transform('babelify')
				.bundle();
		}))
		.pipe(buffer())
		.pipe(map.init())
		.pipe(uglify())
		.pipe(map.write('./maps'))
		.pipe(rename({ extname: '.bundle.js' }))
		.pipe(gulp.dest('public/scripts'));
});


gulp.task('vendor', () => {
	const bv = browserify({
		debug: true,
	});

	vendors.forEach((lib) => {
		bv.require(lib);
	});

	bv.bundle()
		.pipe(source('vendor.js'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(gulp.dest('public/scripts'));
});
/**
 * es task watcher
 */
gulp.task('watchJs', ['compile'], reload);

/**
 * minify html
 */
gulp.task('html', () => {
	return gulp.src('src/*.html')
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest('public'));
});

/**
 * html task watcher
 */
gulp.task('watchHTML', ['html'], reload);

/**
 * initialise browsersync and register watchers
 */
gulp.task('serve', () => {
	browserSync.init({
		browser: ['google-chrome'],	// default browser
		server: {
			baseDir: 'public',		// specify files to serve here
			middleware: [superstatic({ stack: 'strict' })],
		},
	});
	gulp.watch('src/*.html', ['watchHTML']);
	gulp.watch(['src/**/*.css', 'postcss.config.js'], ['watchCss']);
	gulp.watch('src/scripts/*.js', ['watchJs']);
});

/**
 * assign default task to run on gulp
 */
gulp.task('default', ['html', 'css', 'vendor', 'compile', 'serve']);

