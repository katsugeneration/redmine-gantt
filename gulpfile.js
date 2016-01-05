var gulp = require("gulp");
var babel = require("gulp-babel");
var mocha = require('gulp-mocha');

gulp.task('babel', function() {
	gulp.src('./src/**/*.js')
		.pipe(babel({presets:['react']}))
		.pipe(gulp.dest('./dist'))
});

gulp.task('watch', function() {
 	gulp.watch('./src', ['babel'])
});

gulp.task('test', function() {
	gulp.src('./test/**/*.js')
		.pipe(mocha({reporter:'list'}))
});

gulp.task('default', ['babel', 'watch']);
