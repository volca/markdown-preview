const gulp = require('gulp');
const rename = require('gulp-rename')

gulp.task('lib', function () {
  gulp.src(['node_modules/marked-highlight/lib/index.cjs'])
    .pipe(rename('index.js'))
    .pipe(gulp.dest('js/marked-highlight'))

  gulp.src(['node_modules/marked-gfm-heading-id/lib/index.umd.js'])
    .pipe(rename('index.umd.js'))
    .pipe(gulp.dest('js/marked-gfm-heading-id'))

  // Must edit the katex-swap.css and change the fonts file URL
  gulp.src([
    'node_modules/katex/dist/katex-swap.css'
  ]).pipe(gulp.dest('css'))

  gulp.src([
    'node_modules/katex/dist/fonts/*'
  ]).pipe(gulp.dest('css/fonts'))

  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/marked/lib/marked.umd.js',
    'node_modules/mermaid/dist/mermaid.min.js',
    'node_modules/katex/dist/katex.min.js'
  ]).pipe(gulp.dest('js'));
});

