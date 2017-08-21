/**
 * dependencies
 */

//==================== Gulp ==========================
var gulp = require('gulp');
var util = require('gulp-util');
var map = require('gulp-sourcemaps');

//=================== Server ========================= 
var superstatic = require('superstatic');
var browserSync = require('browser-sync').create();

//================== Dev =============================
var postcss = require('gulp-postcss');
var babel = require('gulp-babel');
var htmlmin = require('gulp-htmlmin');


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
gulp.task('css', function () {
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
gulp.task('es', function () {
	return gulp.src('src/scripts/*.js')
		.pipe(map.init())
		.pipe(babel())
		.pipe(map.write('./maps'))
		.pipe(gulp.dest('public'));
});

/**
 * es task watcher
 */
gulp.task('watchJs', ['es'], reload);

/**
 * minify html
 */
gulp.task('html', function () {
	return gulp.src('src/*.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('public'))
});

/**
 * html task watcher
 */
gulp.task('watchHTML', ['html'], reload);

/**
 * initialise browsersync and register watchers
 */
gulp.task('serve', function () {
	browserSync.init({
		browser:['google-chrome'],	// default browser
		server: {
			baseDir: 'public',		// specify files to serve here
			middleware: [superstatic({
				stack: 'strict',
			})]
		}
	});
	gulp.watch('src/*.html', ['watchHTML']);
	gulp.watch(['src/**/*.css', 'postcss.config.js'], ['watchCss'])
	gulp.watch('src/scripts/*.js' , ['watchJs'])
});

/**
 * assign default task to run on gulp
 */
gulp.task('default', ['html', 'css', 'es', 'serve']);