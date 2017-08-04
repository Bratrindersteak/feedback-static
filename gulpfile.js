'use strict';

var gulp = require('gulp');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var banner = require('gulp-banner');
var base64 = require('gulp-base64');
var base64img = require('gulp-base64-img');
var spriter = require('gulp-css-spriter');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var htmlmin = require('gulp-htmlmin');
var del = require('del');

var date;
var current_date;
var current_time;
var version_info;

var versionInfo = function () {
	date = new Date();
	current_date = date.getFullYear() + '-' + checkDigit(date.getMonth() + 1) + '-' + checkDigit(date.getDate());
	current_time = checkDigit(date.getHours()) + ':' + checkDigit(date.getMinutes()) + ':' + checkDigit(date.getSeconds());
	version_info = '/*\n' + 'Change by PengWu on ' + current_date + ' ' + current_time +'\n*/\n';
};

var checkDigit = function (value) {

	if (value.toString().length === 1) {
		value = '0' + value;
	}

	return value;
};

var uglify_config = {
	mangle: {
		except: ['require', 'module', 'exports', '$']
	}
};

// var changed = require('gulp-changed');
// var rename = require('gulp-rename');
// var babel = require('gulp-babel');
// var obfuscate = require('gulp-obfuscate');
// var rev = require('gulp-rev');
// var revCollector = require('gulp-rev-collector');
// var cache = require('gulp-cache');
// var clean = require('gulp-clean');

// var obfuscate_config = {
// 	replaceMethod: obfuscate.ZALGO,
// 	exclude: ['Function', 'document', 'body', 'footer', 'headLoginBtn', 'ppCarLocation', 'ppCarSeries', 'ppBrandYear', 'ppTripDistance', 'ppExpectedPrice', 'ppOwnerDescription', 'ppPhoneNumber', 'ppCode', 'ppAreaSelectProvincesBox', 'ppSubmit', 'id', 'data', 'value', 'length', 'height', 'innerHTML', 'checked', 'success', 'error', 'display', 'pinyin', 'letter', 'year', 'i', 'disabled', 'model', 'name']
// };

gulp.task('banner:js', function() {
	versionInfo();

	return gulp.src(['./src/js/**/*.js', '!./src/js/lib/*', '!./src/js/babel.js'])
		.pipe(banner(version_info))
		.pipe(gulp.dest('./src/js'));
});

gulp.task('compress:js', ['clean:js'], function() {
	versionInfo();

	return gulp.src(['./src/js/**/*.js', '!./src/js/lib/*', '!./src/js/babel.js'])
		// .pipe(obfuscate(obfuscate_config))
		// .pipe(uglify(uglify_config))
		.pipe(uglify(uglify_config)).on('error', function(e) {
    		console.log(e);
    	})
		// .pipe(rev())
		.pipe(banner(version_info))
		.pipe(gulp.dest('./dist/js'));
		// .pipe(rev.manifest())
		// .pipe(gulp.dest('./rev/js'));
});

gulp.task('sass-expanded', ['clean:css'], function() {
	versionInfo();

	return gulp.src('./sass/feedback.scss')
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(banner(version_info))
		.pipe(gulp.dest('./src/css'));
});

gulp.task('sass-compressed', ['clean:css'], function() {
	versionInfo();

	return gulp.src('./sass/feedback.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(banner(version_info))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('base64', ['sass-expanded', 'sass-compressed'], function () {
    return gulp.src('./src/css/*.css')
		.pipe(base64())
		.pipe(gulp.dest('./src/css'));
});

gulp.task('imagemin', ['clean:image'], function() {
	return gulp.src('./src/img/*.{png,jpg,gif,ico}')
		.pipe(imagemin({
			optimizationLevel: 5,
			progressive: true
		}))
		// .pipe(rev())
		.pipe(gulp.dest('./dist/img'));
		// .pipe(rev.manifest())
		// .pipe(gulp.dest('./rev/img'));
});

gulp.task('revJs', ['compress:js'], function() {
	// return gulp.src(['./rev/js/*.json', './view/*.html'])
	// 	.pipe(revCollector({
	// 		replaceReved: true
	// 	}))
	// 	.pipe(gulp.dest('./view'));
});

gulp.task('revCss', ['base64'], function() {

});

gulp.task('revImgH', ['imagemin'], function() {
	// return gulp.src(['./rev/img/*.json', './view/*.html'])
		// .pipe(revCollector({
		// 	replaceReved: true
		// }))
		// .pipe(gulp.dest('./view'));
		
});

gulp.task('revImgC', ['imagemin'], function() {
	// return gulp.src(['./rev/img/*.json', './sass/*.scss'])
		// .pipe(revCollector({
		// 	replaceReved: true
		// }))
		// .pipe(gulp.dest('./sass'));
		
});

gulp.task('compressHTML', ['revJs', 'revImgH', 'revImgC', 'revCss', 'clean:html'], function() {
	return gulp.src('./src/**/*.html')
		.pipe(htmlmin({
			removeComments: true, //清除HTML注释
			collapseWhitespace: true, //压缩HTML
			collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
			removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
			removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
			removeStyleLinkTypeAttributes: false, //删除<style>和<link>的type="text/css"
			minifyJS: true, //压缩页面JS
			minifyCSS: true //压缩页面CSS
		}))
		.pipe(gulp.dest('./dist'));
});

gulp.task('clean:js', function() {
	del(['./dist/js/**/*.js', '!./dist/js/lib/*']);
});

gulp.task('clean:css', function() {
	del(['./src/css/*', './dist/css/*', '!./src/css/lib*', '!./dist/css/lib*', '!./src/css/iautos-cooperation.css', '!./dist/css/iautos-cooperation.css']);
});

gulp.task('clean:image', function() {
	del(['./dist/img/*']);
});

gulp.task('clean:html', function() {
	del(['./dist/**/*.html']);
});

gulp.task('default', ['compressHTML'], function() {
	date = new Date();

	gulp.watch(['./src/js/**/*.js', '!./src/js/lib/*'], ['revJs']);
	gulp.watch('./sass/*.scss', ['revCss']);
	gulp.watch('./src/img/*.{png,jpg,gif,ico}', ['revImgH', 'revImgC']);
	gulp.watch('./src/**/*.html', ['compressHTML']);
});

// gulp.task('babel', function () {
//     return gulp.src('./src/js/babel.js')
//         .pipe(babel({
//             presets: ['es2015']
//         }))
//         .pipe(uglify(uglify_config))
//         .pipe(gulp.dest('./dist/js'));
// });