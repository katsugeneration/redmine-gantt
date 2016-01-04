var gulp = require("gulp");
var babel = require("gulp-babel");

gulp.task('babel', function() {
	gulp.src('./src/**/*.js')
		.pipe(babel({presets:['react']}))
		.pipe(gulp.dest('./dist'))
});

gulp.task('watch', function() {
 	gulp.watch('./src', ['babel'])
});

gulp.task('default', ['babel', 'watch']);
