gulp = require 'gulp'
$ = do require 'gulp-load-plugins'

gulp.task 'default', ['coffee']

gulp.task 'coffee', ->
  gulp.src './src/app.coffee'
  .pipe $.plumber()
  .pipe $.coffee()
  .pipe gulp.dest './'

gulp.task 'watch', ->
  gulp.watch './src/app.coffee', ['coffee']