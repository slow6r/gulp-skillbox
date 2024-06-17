const { src, dest, series, watch, parallel } = require("gulp");
const concat = require("gulp-concat");
const htmlMin = require("gulp-htmlmin");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const svgSprite = require("gulp-svg-sprite");
const image = require('gulp-image');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
const notify = require("gulp-notify");
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require("browser-sync").create();
const gulpif = require('gulp-if');

// Определение среды сборки
const isProd = process.env.NODE_ENV === 'production';

// Перемещение ресурсов
const resources = () => {
  return src('src/resources/**')
    .pipe(dest('dist'))
}

// Очистка папки dist
const clean = () => {
  return del(['dist'])
}

// Стили
const styles = () => {
  return src("src/styles/**/*.css")
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(concat("main.css"))
    .pipe(autoprefixer({
      cascade: false,
    }))
    .pipe(cleanCSS({
      level: 2,
    }))
    .pipe(gulpif(!isProd, sourcemaps.write()))
    .pipe(dest("dist"))
    .pipe(browserSync.stream())
};

// Скрипты
const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
    .pipe(gulpif(!isProd, sourcemaps.init()))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat('app.js'))
    .pipe(gulpif(isProd, uglify({
      toplevel: true
    }).on('error', notify.onError())))
    .pipe(gulpif(!isProd, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
};

// Минификация HTML
const htmlMinify = () => {
  return src("src/**/*.html")
    .pipe(gulpif(isProd, htmlMin({
      collapseWhitespace: true,
    })))
    .pipe(dest("dist"))
    .pipe(browserSync.stream())
};

// SVG спрайты
const svgSprites = () => {
  return src('src/images/**/*.svg')
    .pipe(svgSprite({
      mode: {
        stack: {
          sprite:'../sprite.svg'
        }
      }
    }))
    .pipe(dest('dist/images'))
};

// Обработка изображений
const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/*.svg',
    'src/images/**/*.jpeg',
  ])
    .pipe(gulpif(isProd, image()))
    .pipe(dest('dist/images'))
};

// Наблюдение за файлами и запуск сервера
const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  });

  watch('src/**/*.html', htmlMinify);
  watch('src/styles/**/*.css', styles);
  watch('src/images/svg/**/*.svg', svgSprites);
  watch('src/js/**/*.js', scripts);
  watch('src/images');
  watch('src/resources/**', resources);
};

// Определение задач
exports.clean = clean;
exports.styles = styles;
exports.scripts = scripts;
exports.htmlMinify = htmlMinify;
exports.resources = resources;
exports.images = images;
exports.svgSprites = svgSprites;

// Задача по умолчанию для разработки
exports.dev = series(clean, resources, htmlMinify, styles, svgSprites, images, scripts, watchFiles);

// Задача для сборки
exports.build = series(clean, resources, htmlMinify, styles, svgSprites, images, scripts);
