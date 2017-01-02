module.exports = function (grunt) {

  // Load grunt tasks automatically
  require("load-grunt-tasks")(grunt);
  const packageConfig = grunt.file.readJSON("./package.json");

  // Project configuration.
  grunt.initConfig({
    // Configurable paths for the application
    "appConfig": {
      "dist": packageConfig.distDir,
      "name": packageConfig.name,
      "src": packageConfig.srcDir,
      "testDist": packageConfig.testDist,
      "testSrc": packageConfig.testSrc
    },

    "babel": {
      "options": {
        "sourceMap": true
      },
      "dist": {
        "files": [{
          "expand": true,
          "cwd": "<%= appConfig.src %>",
          "src": ["**/*.es6"],
          "dest": "<%= appConfig.dist %>",
          "ext": ".js"
        }]
      },
      "test": {
        "files": [{
          "expand": true,
          "cwd": "<%= appConfig.testSrc %>",
          "src": ["**/*.es6"],
          "dest": "<%= appConfig.testDist %>",
          "ext": ".js"
        }]
      }
    },
    "clean": {
      "dist": ["<%= appConfig.dist %>"],
      "test": ["<%= appConfig.testDist %>"]
    },
    "copy": {
      "main": {
        "expand": true,
        "cwd": "<%= appConfig.src %>",
        "src": "**/*.json",
        "dest": "<%= appConfig.dist %>"
      }
    },

    "eslint": {
      "target": [
        "Gruntfile.js",
        "<%= appConfig.src %>/**/*.es6",
        "<%= appConfig.testSrc %>/**/*.es6"
      ],
      "options": {
        "format": require("eslint-stylish-config")
      }
    },

    "shell": {
      "lab": {
        "command": "./node_modules/.bin/lab --verbose --colors -r console -o stdout -r html -o coverage.html '<%= appConfig.testDist %>'"
      },
      "labquick": {
        "command": "./node_modules/.bin/lab --colors '<%= appConfig.testDist %>'"
      },
      "options": {
        "execOptions": {
          // This stops the "Warning: stdout maxBuffer exceeded" errors.
          "maxBuffer": 1048576
        }
      }
    }

  });

  // Default task(s).
  grunt.registerTask("default", ["test"]);

  // Common build task
  grunt.registerTask("build", [
    "clean",
    "eslint",
    "babel:dist"
  ]);

  grunt.registerTask("test", [
    "build",
    "babel:test",
    "shell:lab"
  ]);

  grunt.registerTask("quicktest", [
    "clean",
    "babel:dist",
    "babel:test",
    "shell:labquick"
  ]);

};
