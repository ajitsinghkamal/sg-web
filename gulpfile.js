var gulp = require('gulp');
var util = require('gulp-util');
//server stuff
var superstatic = require('superstatic');
var browserSync = require('browser-sync').create();
//dev stuff
var postcss = require('gulp-postcss');
var babel = require('gulp-babel');
var htmlmin = require('gulp-htmlmin');

function reload(done) {
	browserSync.reload();
	done();
}

gulp.task('css', function () {
	return gulp.src('src/*.css')
		.pipe(postcss())
		.pipe(gulp.dest('public/stylesheets'));
});

gulp.task('watchCss', ['css'], reload );


gulp.task('es', function () {
	return gulp.src('src/*.js')
		.pipe(babel())
		.pipe(gulp.dest('public'));
});

gulp.task('watchJs', ['es'], reload);

gulp.task('minify', function () {
	return gulp.src('src/*.html')
		.pipe(util.env.production? htmlmin({
			collapseWhitespace: true,
		}) : util.noop())
		.pipe(gulp.dest('public'))
});

gulp.task('watchHTML', ['minify'], reload);

gulp.task('default', ['css', 'es', 'serve']);

gulp.task('serve', function () {
	browserSync.init({
		browser:['google-chrome'],
		server: {
			baseDir: 'public',
			middleware: [superstatic({
				stack: 'strict',
			})]
		}
	});
	gulp.watch('src/*.html', ['watchHTML']);
	gulp.watch(['src/*.css', 'postcss.config.js'], ['watchCss'])
	gulp.watch('src/*.js' , ['watchJs'])
});