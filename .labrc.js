"use strict";

/* *********************************************
   Setup of global configuration options for Lab
   ********************************************* */
module.exports = {
  "coverage": true,
  "lint": false,
  "assert": "code",
  "globals": ["regeneratorRuntime", "Observable", "__core-js_shared__",
    "core", "System", "_babelPolyfill", "asap"].join(","),
  "sourcemaps": true
};