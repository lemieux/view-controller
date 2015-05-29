/*!
 * Bootstrap's Gruntfile
 * http://getbootstrap.com
 * Copyright 2013-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */

module.exports = function(grunt) {
    'use strict';

    // Force use of Unix newlines
    grunt.util.linefeed = '\n';

    RegExp.quote = function(string) {
        return string.replace(/[-\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    var fs = require('fs');
    var path = require('path');

    // Project configuration.
    grunt.initConfig({

        jshint: {
            options: {
                jshintrc: 'js/.jshintrc'
            },
            src: {
                src: 'js/**/*.js'
            },
            test: {
                src: 'js/tests/unit/**/*.js'
            },
            assets: {
                src: 'docs/assets/js/_src/**/*.js'
            }
        },

        jscs: {
            options: {
                config: 'js/.jscsrc'
            },
            src: {
                src: '<%= jshint.src.src %>'
            },
            test: {
                src: '<%= jshint.test.src %>'
            },
            assets: {
                options: {
                    requireCamelCaseOrUpperCaseIdentifiers: null
                },
                src: '<%= jshint.assets.src %>'
            }
        },

        watch: {
            options: {
                livereload: true,
            },
            js: {
                files: [
                    '<%= jshint.src.src %>',
                    'js/templates/**/*.hbs',
                    'docs/assets/js/_src/**/*.js'
                ],
                tasks: ['jshint:src']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            }
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: false,
                browsers: ['Chrome', 'PhantomJS']
            },
            ci: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },


        sed: {
            versionNumber: {
                pattern: ( function() {
                    var old = grunt.option('oldver');
                    return old ? RegExp.quote(old) : old;
                } )(),
                replacement: grunt.option('newver'),
                recursive: true
            }
        }
    });


    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {
        scope: 'devDependencies'
    });
    grunt.registerTask('test:unit', ['karma:unit']);
    grunt.registerTask('test:ci', ['karma:ci']);
    // Default task.
    grunt.registerTask('default', ['test']);

    grunt.registerTask('dev', ['watch']);

    // Version numbering task.
    // grunt change-version-number --oldver=A.B.C --newver=X.Y.Z
    // This can be overzealous, so its changes should always be manually reviewed!
    grunt.registerTask('change-version-number', 'sed');
};