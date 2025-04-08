const gulp = require('gulp');
const rename = require('gulp-rename')

gulp.task('lib', function () {
  gulp.src(['node_modules/marked-highlight/lib/index.cjs'])
    .pipe(rename('index.js'))
    .pipe(gulp.dest('js/marked-highlight'))

  gulp.src([
    'node_modules/katex/dist/katex.min.css'
  ]).pipe(gulp.dest('css'))

  gulp.src([
    'node_modules/katex/dist/fonts/*'
  ]).pipe(gulp.dest('css/fonts'))

  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/marked/marked.min.js',
    'node_modules/mermaid/dist/mermaid.min.js',
    'node_modules/katex/dist/katex.min.js'
  ]).pipe(gulp.dest('js'));
});

