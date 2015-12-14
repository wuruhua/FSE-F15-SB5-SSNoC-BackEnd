module.exports = function(grunt) {
    // Project configurations
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            options: {
                 reporter: require('jshint-html-reporter'),
                 reporterOutput: 'jshint-report.html',
                browser: true, // browser environment
                devel: true // 
            },
            files: ['public/script/*.js',
            'app/controller/*.js',
            'app/model/*.js'
            ]
        },
        mochaTest: {
            local: {
                options: {
                    reporter: 'spec',
                    //captureFile: 'results.txt', // Optionally capture the reporter output to a file
                    quiet: false, // Optionally suppress output to standard out (defaults to false)
                    clearRequireCache: false, // Optionally clear the require cache before running tests (defaults to false)
                    ui: 'tdd'
                },
                src: ['test/**/*.js']
            },
            shippable: {
                options: {
                    reporter: 'mocha-junit-reporter',
                    reporterOptions: {
                        mochaFile: 'shippable/testresults/result.xml'
                    },
                    ui: 'tdd'
                },
                src: ['test/**/*.js']
            },

        },
        mocha_istanbul: {
            coverage: {
                src: 'test/**/*.js', // a folder works nicely
                options: {
                    mochaOptions: ['--ui', 'tdd'] // any extra options for mocha
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    // grunt.loadNpmTasks('grunt-mocha'); Client Side testing
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    //grunt.registerTask('default', []);
    //static analysis
    grunt.registerTask('default', ['jshint']);

    //Test
    grunt.registerTask('test', ['mochaTest:local']);

    // Shippable
    grunt.registerTask('shippable', ['mochaTest:shippable', 'mocha_istanbul']);

    //Coverage
    grunt.registerTask('coverage', ['mocha_istanbul']);
};
