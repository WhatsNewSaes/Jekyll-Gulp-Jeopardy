var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var uncss = require('gulp-uncss');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');

// var imagemin = require('gulp-imagemin');
var ghPages = require('gulp-gh-pages');



var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


// Build the Jekyll Site 
gulp.task('jekyll-build', function(done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {
            stdio: 'inherit'
        })
        .on('close', done);
});

// Rebuild Jekyll & do page reload
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
    browserSync.reload();
});


// Wait for jekyll-build, then launch the Server
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

// looks through all html files in _site and removes unnecessary css, then minifies, then autoprefixes to main.css
gulp.task('uncss', function() {
    return gulp.src('_site/css/main.css')
        .pipe(uncss({
            html: ['_site/*.html']
        }))
    .pipe(autoprefixer({
        browsers: ['last 6 versions'],
        cascade: false
    }))

    .pipe(minifyCss())
        .pipe(gulp.dest('_site/css'))
});

// minifies all html files with _site
gulp.task('minify', function() {
    return gulp.src('_site/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('_site'))
});

gulp.task('uglify', function() {
    gulp.src('_site/js/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('_site/js'))
});



// Compiles files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
gulp.task('sass', function() {
    return gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            errLogToConsole: false,
            onError: function(err) {
                return notify().write(err);
            }
        }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest('css'));
});

// ghpages: deploys _site directory to github pages branch
// * Note * see 'deploy' task below
gulp.task('ghpages', function() {
  return gulp.src('_site/**/*')
    .pipe(ghPages());
});


// Watch scss files for changes & recompile
// Watch html/md files, run jekyll & reload BrowserSync

gulp.task('watch', function() {
    gulp.watch('_scss/**/*.scss', ['sass']);
    gulp.watch(['*.html', '_config.yml', '_layouts/*.html', '_includes/*.html', '_posts/*'], ['jekyll-rebuild']);
});


// Default task, running just `gulp` will compile the sass,
// Compile the jekyll site, launch BrowserSync & watch files.
gulp.task('default', ['browser-sync', 'watch']);
gulp.task('production', ['uncss', 'minify']);
