module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		compass: {
			dist: {
				options: {
					sassDir: 'sass',
					cssDir: 'css',
					environment: 'production'
				}
			}
		},

		requirejs: {
			compile: {
				options: {
					optimize: "none",
					name: 'main',
					include: ['config'],
					// baseUrl: "",
					mainConfigFile: "js/config.js",
					out: "scripts/main.min.js"
				}
			}
		},

		watch: {
			scrips: {
				files: ['js/**/*.js'],
				tasks: ['requirejs']
			},
			css: {
				files: ['sass/**/*.scss'],
				tasks: ['compass']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['requirejs', 'compass'])
	grunt.registerTask('w', ['build', 'watch'])
}