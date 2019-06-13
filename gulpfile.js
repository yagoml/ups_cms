var gulp = require('gulp');
var bower = require('bower');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = [
    './src/css/**/*.css',
    './src/js/**/*.js'
];

gulp.task('default', function () {
    gulp.start('css');
    gulp.start('js');

    gulp.watch(paths, function () {
        gulp.start('css');
        gulp.start('js');
    });
});

gulp.task('css', function () {
    return gulp.src('./src/css/**/*.css')
        .pipe(concat('dist.min.css'))
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest('./dist/'));

});

gulp.task('js', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(concat('dist.min.js'))
        .pipe(uglify({compress: {sequences: false}}))
        .pipe(gulp.dest('./dist/'));

});