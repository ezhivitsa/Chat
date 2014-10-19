module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		sass: {
			dist: {
				files: {
					'css/main.css': ['sass/style.scss']
				}
			}
		},

		requirejs: {
			compile: {
				options: {
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
				tasks: ['sass']
			}
		}

	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', ['requirejs', 'sass'])
	grunt.registerTask('w', ['build', 'watch'])
}