const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const header = require('gulp-header');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  ''
].join('');

// Compiles SCSS files from /scss into /css
function compileSass() {
  return gulp.src('scss/resume.scss')
    .pipe(sass())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify compiled CSS
function minifyCss() {
  return gulp.src('css/resume.css')
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
}

// Minify custom JS
function minifyJs() {
  return gulp.src('js/resume.js')
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
}

// Copy vendor files from /node_modules into /vendor
// NOTE: requires `npm install` before running!
function copyVendor() {
  gulp.src([
    'node_modules/bootstrap/dist/**/*',
    '!**/npm.js',
    '!**/bootstrap-theme.*',
    '!**/*.map'
  ]).pipe(gulp.dest('vendor/bootstrap'));

  gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest('vendor/jquery'));

  gulp.src(['node_modules/jquery.easing/*.js'])
    .pipe(gulp.dest('vendor/jquery-easing'));

  gulp.src([
    'node_modules/font-awesome/**',
    '!node_modules/font-awesome/**/*.map',
    '!node_modules/font-awesome/.npmignore',
    '!node_modules/font-awesome/*.txt',
    '!node_modules/font-awesome/*.md',
    '!node_modules/font-awesome/*.json'
  ]).pipe(gulp.dest('vendor/font-awesome'));

  gulp.src([
    'node_modules/devicons/**/*',
    '!node_modules/devicons/*.json',
    '!node_modules/devicons/*.md',
    '!node_modules/devicons/!PNG',
    '!node_modules/devicons/!PNG/**/*',
    '!node_modules/devicons/!SVG',
    '!node_modules/devicons/!SVG/**/*'
  ]).pipe(gulp.dest('vendor/devicons'));

  gulp.src(['node_modules/simple-line-icons/**/*', '!node_modules/simple-line-icons/*.json', '!node_modules/simple-line-icons/*.md'])
    .pipe(gulp.dest('vendor/simple-line-icons'));
}

// Configure the browserSync task
function browserSyncServe(done) {
  browserSync.init({
    server: {
      baseDir: ''
    },
  });
  done();
}

// Reload the browser
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// Watch files
function watchFiles() {
  gulp.watch('scss/*.scss', gulp.series(compileSass, minifyCss));
  gulp.watch('css/*.css', minifyCss);
  gulp.watch('js/*.js', minifyJs);
  gulp.watch('*.html', browserSyncReload);
  gulp.watch('js/**/*.js', browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(copyVendor);
const build = gulp.series(compileSass, minifyCss, minifyJs, vendor);
const watch = gulp.parallel(watchFiles, browserSyncServe);

// Export tasks
exports.sass = compileSass;
exports.minifyCss = minifyCss;
exports.minifyJs = minifyJs;
exports.copyVendor = copyVendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
