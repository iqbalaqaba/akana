const { src, dest, parallel, watch } = require("gulp");
var nunjucksRender = require("gulp-nunjucks-render");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");

//asset css
var bootstrapCSS = "./node_modules/bootstrap/dist/css/bootstrap.min.css";
var swiperCSS = "./node_modules/swiper/dist/css/swiper.min.css";
var nouisliderCSS = "./node_modules/nouislider/distribute/nouislider.min.css";

//asset js
var bootstrapJS = "./node_modules/bootstrap/dist/js/bootstrap.min.js";
var jqueryJS = "./node_modules/jquery/dist/jquery.slim.min.js";
var popperJS = "./node_modules/popper.js/dist/umd/popper.min.js";
var swiperJS = "./node_modules/swiper/dist/js/swiper.min.js";
var nouisliderJS = "./node_modules/nouislider/distribute/nouislider.min.js";

//assets dir
var ASSETS = {
  SRC: "./app/assets",
  CSS: "./app/assets/css",
  JS: "./app/assets/js",
  IMG: "./app/assets/img",
  SASS: "./app/assets/sass/**/*.scss",
  TESTING: "./app/sandbox/_test"
};

//nunjucks dir
var COMPILE = {
  SRC: "./app/pages/**.njk",
  TMP: "./app/template/",
  DST: "./app"
};

//make structural folder
function folder() {
  return src("*.*", { read: false })
    .pipe(
      plumber({
        errorHandler: function(err) {
          notify.onError({
            title: "Gulp error in " + err.plugin,
            message: err.toString()
          })(err);
        }
      })
    )
    .pipe(dest(ASSETS.SRC))
    .pipe(dest(ASSETS.TESTING))
    .pipe(dest(ASSETS.SASS))
    .pipe(dest(ASSETS.CSS))
    .pipe(dest(ASSETS.JS))
    .pipe(dest(ASSETS.IMG))
    .pipe(
      notify({
        message: "Folder wis dadi"
      })
    );
}

// moving css
function css() {
  return src([bootstrapCSS, swiperCSS, nouisliderCSS])
    .pipe(
      plumber({
        errorHandler: function(err) {
          notify.onError({
            title: "Gulp error in " + err.plugin,
            message: err.toString()
          })(err);
        }
      })
    )
    .pipe(sourcemaps.init())
    .pipe(concat("plugin.min.css"))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(dest(ASSETS.CSS))
    .pipe(
      notify({
        message: "Render asset <%= file.relative %> berhasil"
      })
    );
}

// moving js
function js() {
  return src([jqueryJS, popperJS, bootstrapJS, swiperJS, nouisliderJS])
    .pipe(concat("plugin.min.js"))
    .pipe(uglify())
    .pipe(dest(ASSETS.JS))
    .pipe(
      notify({
        message: "Render asset <%= file.relative %> berhasil"
      })
    );
}

//compile nunjucks
function nunjucks() {
  return src(COMPILE.SRC)
    .pipe(
      nunjucksRender({
        path: [COMPILE.TMP]
      })
    )
    .pipe(dest(COMPILE.DST))
    .pipe(
      notify({
        message: "Render berhasil bos"
      })
    );
}

//minify compile
function minify() {
  return src(ASSETS.SASS)
    .pipe(plumber())
    .pipe(
      sass({
        errorLogToConsole: true
      })
    )
    .on("error", console.error.bind(console))
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(ASSETS.CSS))
    .pipe(browserSync.stream({ once: true }))
    .pipe(
      notify({
        message: "Minify berhasil bos"
      })
    );
}

function build(cb) {
  nunjucks();
  minify()
    .pipe(plumber())
    .pipe(
      notify({
        message: "Build berhasil bos"
      })
    );
  cb();
}

function watching() {
  // nunjucks()
  // minify()

  browserSync.init({
    server: {
      baseDir: "./",
      serveStaticOptions: {
        extensions: ["html"]
      }
    },
    startPath: "./app/",
    port: 3000
  });
  watch("./app/assets/sass/**/*.scss", minify);
  watch(COMPILE.SRC, nunjucks).on("change", browserSync.reload);
  // watch(COMPILE.TMP, nunjucks).on('change', browserSync.reload);
}

exports.folder = folder;
exports.js = js;
exports.css = css;
exports.assets = parallel(js, css);
exports.render = nunjucks;
exports.build = build;
exports.default = watching;
