'use strict';

var path = require('path');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
      
      distdir: 'dist',
      builddir: 'build',

      pkg: grunt.file.readJSON('package.json'),      
      
      src: {
        // This will cover all JS files in 'js' and sub-folders
        js: ['grid/src/js/**/*.js'],
        templates: ['grid/src/templates/**/*.html']
      },
      
      test: { //unit & e2e goes here
        karmaConfig: 'grid/tests/config/karma.conf.js',
        karmaProdConfig: 'grid/tests/config/karma.prod.conf.js',
        karmaAmdConfig: 'grid/tests/config/karma.amd.conf.js',
        unit: ['grid/tests/unit/**/*.js']
      },
      
      jshint: {
        options: {
          jshintrc: 'jshintrc.json'
        },
        files: {
          src: ['Gruntfile.js', '<%= src.js %>', '<%= test.unit %>']
        }
      },
      
      karma: {
        options: {
        },
        build: {
          configFile: '<%= test.karmaConfig %>',
          singleRun: true
        },
        prod: {
          configFile: '<%= test.karmaProdConfig %>',
        },
        amd: {
          configFile: '<%= test.karmaAmdConfig %>',
        },
        dev: {
          configFile: '<%= test.karmaConfig %>',
          singleRun: false
        }
      },

      connect: {
        web: {
          options: {
            port: 9000,
            bases: '.',
            keepalive: true
          }
        }
      },

      express: {
        api: {
          options: {
            port: 9001,
            server: path.resolve('./demo/server')
          }
        }
      },

      watch: {
        templates: {
          files: "<%= src.templates %>",
          tasks: ['html2js'],
        },
        jshint: {
          files: ["<%= src.js %>", "<%= test.unit %>"],
          tasks: ['jshint']
        }
      },

      html2js: {
        options: {
          base: "grid/src",
          module: "adp.ds.ui.grid.templates"
        },
        main: {
          src: "<%= src.templates %>",
          dest: "<%= builddir %>/templates.js"
        }
      },

      concat: {
        dist: {
          src: ['define.prefix', '<%= src.js %>', '<%= builddir %>/templates.js', 'define.suffix'],
          dest: '<%= distdir %>/adp.ds.ui.grid.2.0.0.js'
        },
        test: {
          src: ['<%= test.unit %>'],
          dest: '<%= builddir %>/tests/unit-tests.js'
        }
      },

      uglify: {
          options: {
              mangle: false,
              beautify: false,
              lint:false,
              compress: false,
              warnings:false
          },
          my_target: {
              files: {
                  "<%= distdir %>/adp.ds.ui.grid.2.0.0.min.js":
                  [
                  "<%= distdir %>/adp.ds.ui.grid.2.0.0.js"
                  ]
              }
          }
      },

      concurrent: {
        dev: {
          tasks: ['web', 'api', 'watch', 'watch-tests'],
          options: {
            logConcurrentOutput: true
          }
        }
      }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-html2js');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-concurrent');
    
    grunt.registerTask('default', ['jshint', 'html2js', 'karma:build', 'concat', 'uglify', 'karma:prod', 'karma:amd']);
    grunt.registerTask('watch-tests', ['karma:dev']);
    grunt.registerTask('web', ['connect:web']);
    grunt.registerTask('api', ['express:api', 'express-keepalive']);
    grunt.registerTask('dev', ['concurrent:dev']);
};