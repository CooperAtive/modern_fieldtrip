'use strict';

var mongoose = require('mongoose'),
    User = require('./models/user');

module.exports = function( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // ENVIRONMENT
    env: {
      options: {
      },
      dev: {
        NODE_ENV: 'dev'
      },
      test: {
        NODE_ENV: 'test'
      }
    },

    // BUILD TASKS
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ["public/js/libs/jquery.js",
              "public/js/libs/bootstrap.js",
              "public/js/libs/handlebars.js",
              "public/js/libs/ember.js",
              "public/js/libs/moment.js",
              "public/js/libs/smooth-scroll.js",
              "js/app.js",
              "js/helpers/helpers.js",
              "js/router.js",
              "js/routes/*.js",
              "js/controllers/*.js",
              "js/templates.js",
              "js/views/*.js",
              "js/components/*.js"],
        dest: 'dist/built.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },

    clean: {
      build: {
        src: ['dist', 'dist']
      }
    },

    emberTemplates: {
      compile: {
        options: {
          templateBasePath: /public\/js\/templates\//
        },
        files: {
          'public/js/templates.js': 'public/js/templates/**/*.hbs'
        }
      }
    },

    // DEVELOPMENT TASKS
    jshint: {
      files: ['Gruntfile.js', 'server.js', 'public/js/**/*/.js'],

      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        }
      }
    },

    express: {
      options: {
        // Override defaults here
      },
      dev: {
        options: {
          script: 'server.js',
          node_env: 'dev'
        }
      },
      prod: {
        options: {
          script: 'server.js',
          node_env: 'production'
        }
      },
      test: {
        options: {
          script: 'server.js',
          node_env: 'test'
        }
      }
    },

    watch: {
      express: {
        files:  [
          'public/js/**/*',
          'server.js',
          'routes/**/*.js',
          'models/**/*.js',
          'index.html',
          'Gruntfile.js'],
        tasks:  [ 'build:dev', 'express:dev' ],
        options: {
          // for grunt-contrib-watch v0.5.0+, "nospawn: true" for lower versions.
          // Without this option specified express won't be reloaded
          spawn: false,
          livereload: true
        }
      }
    },
    casperjs: {
      options: {
        async: {
          parallel: false
        }
      },
      files: ['tests/acceptance/index_page_spec.js',
              'tests/acceptance/signup_page_spec.js',
              'tests/acceptance/login_page_spec.js',
              'tests/acceptance/trips_page_spec.js',
              'tests/acceptance/downtown_seattle_page_spec.js'
      ]
    }
  });

  grunt.registerTask('dropUsers', 'drop the users collection', function() {
    // async mode
    var done = this.async();

    mongoose.connect( 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@' + process.env.MONGO_URL + '/' + process.env.MONGO_DB );

    User.remove({}, function() {
      done();
    });
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ember-templates');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-casperjs');

  grunt.registerTask('test:acceptance', ['build:dev', 'env:dev', 'express:dev', 'casperjs', 'dropUsers'])
  grunt.registerTask('build:dev', ['emberTemplates']);
  grunt.registerTask('build:prod', ['clean', 'emberTemplates', 'concat', 'uglify']);
  grunt.registerTask('server', [ 'env:dev', 'build:dev', 'express:dev', 'watch:express']);
};
