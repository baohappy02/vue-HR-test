const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  // configureWebpack: {
  //   devtool: "source-map",
  // },
  // devServer: {
  //   host: "localhost",
  //   port: 8080,
  //   hot: true, // Enable Hot Module Replacement
  //   liveReload: true, // Enable live reloading
  //   watchFiles: ["src/**/*", "public/**/*"], // Watch for changes in these directories
  // },
});
