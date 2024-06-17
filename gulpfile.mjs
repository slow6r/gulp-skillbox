import { src, dest, series, watch } from "gulp";
import concat from "gulp-concat";
import htmlMin from "gulp-htmlmin";
import gulpAutoprefixer from "gulp-autoprefixer";
import cleanCSS from "gulp-clean-css";
import svgSprite from "gulp-svg-sprite";
import image from "gulp-image";
import babel from "gulp-babel";
import notify from "gulp-notify";
import { deleteAsync } from "del";
import sourcemaps from "gulp-sourcemaps";
import browserSync from "browser-sync";
import uglify from "gulp-uglify-es";

const isProd = process.env.NODE_ENV === 'production';

const resources = () => {
  return src("src/resources/**").pipe(dest("dist"));
};

const clean = () => {
  return deleteAsync(["dist"]);
};

const styles = () => {
  let pipeline = src("src/styles/**/*.css")
    .pipe(sourcemaps.init())
    .pipe(concat("main.css"))
    .pipe(
      gulpAutoprefixer({
        cascade: false,
      })
    );

  if (isProd) {
    pipeline = pipeline.pipe(
      cleanCSS({
        level: 2,
      })
    );
  }

  return pipeline
    .pipe(sourcemaps.write())
    .pipe(dest("dist"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  let pipeline = src(["src/components/**/*.js"], ["src/**/*.js"])
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ["@babel/env"],
      })
    )
    .pipe(concat("app.js"));

  if (isProd) {
    pipeline = pipeline.pipe(
      uglify({
        toplevel: true,
      }).on("error", notify.onError())
    );
  }

  return pipeline
    .pipe(browserSync.stream())
    .pipe(dest("dist"))
    .pipe(sourcemaps.write());
};

const htmlMinify = () => {
  let pipeline = src("src/**/*.html");

  if (isProd) {
    pipeline = pipeline.pipe(
      htmlMin({
        collapseWhitespace: true,
      })
    );
  }

  return pipeline.pipe(dest("dist")).pipe(browserSync.stream());
};

const svgSprites = () => {
  return src("src/images/**/*.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("dist/images"));
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "dist",
    },
  });

  watch("src/**/*.html", htmlMinify);
  watch("src/styles/**/*.css", styles);
  watch("src/images/svg/**/*.svg", svgSprites);
  watch("src/js/**/*.js", scripts);
  watch("src/images/**/*", images);
  watch("src/resources/**/*", resources);
};

const images = () => {
  return src([
    "src/images/**/*.jpg",
    "src/images/**/*.png",
    "src/images/**/*.svg",
    "src/images/**/*.jpeg",
  ])
    .pipe(image())
    .pipe(dest("dist/images"));
};

const build = series(clean, resources, htmlMinify, styles, scripts, svgSprites, images);
const dev = series(clean, resources, htmlMinify, styles, svgSprites, images, watchFiles);

export { clean, styles, scripts, htmlMinify, resources, images, svgSprites, watchFiles, build, dev };
export default dev;
