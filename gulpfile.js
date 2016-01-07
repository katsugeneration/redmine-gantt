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

gulp.task('test', function() {
	var electron = require('electron-prebuilt');
	var child_process = require('child_process');

	var finished = child_process.spawnSync(
		electron,
        ['test'],
        {stdio: 'inherit'}
    );
	process.exit(finished.status);
});

gulp.task('default', ['babel', 'watch']);
