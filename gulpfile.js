const {
  src,
  dest,
  watch,
  parallel,
  series
} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const browserSync = require('browser-sync').create();
const addSrc = require('gulp-add-src');
const svgSprite = require('gulp-svg-sprite');

function svgsprite() {
  return src('app/images/icons/*.svg')
  .pipe(svgSprite({
    mode: {
      symbol: {
        sprite: '../sprite.svg'
      },
    }
  }))
  .pipe(dest('app/images'))
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    },
    notify: false
  })
}

function styles() {
  return src([
      'app/scss/style.scss',
      // 'node_modules/slick-carousel/slick/slick.scss',
    ])
    .pipe(scss({
      outputStyle: 'compressed'
    }))
    // .pipe(addSrc([
    //   'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.min.css'
    // ]))
    .pipe(concat('style.min.css'))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      grid: true
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([
      // 'node_modules/jquery/dist/jquery.js',
      // 'node_modules/slick-carousel/slick/slick.js',
      // 'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
      // 'node_modules/mixitup/dist/mixitup.js',
      // 'node_modules/swiper/swiper-bundle.js',
      'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({
        interlaced: true
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
      imagemin.optipng({
        optimizationLevel: 5
      }),
      imagemin.svgo({
        plugins: [{
            removeViewBox: true
          },
          {
            cleanupIDs: false
          }
        ]
      })
    ]))
    .pipe(dest('dist/images'))
}

function build() {
  return src([
    'app/**/*.html',
    'app/**/*.php',
    'app/css/style.min.css',
    'app/js/main.min.js',
    'app/fonts/*.woff2',
    'app/fonts/*.woff',
    ], {
      base: 'app'
    })
    .pipe(dest('dist'))
}

function cleanDist() {
  return del('dist')
}

function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
  watch('app/images/icons/*.svg', svgsprite);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.svgsprite = svgsprite;
exports.build = series(cleanDist, images, build);

exports.default = parallel(styles, scripts, svgsprite, browsersync, watching);