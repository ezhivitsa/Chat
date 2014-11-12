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
		},

		vulcanize: {
			default: {
				options: {
					inline: true,
					excludes: {
						scripts: [
							"bower_components/requirejs/require.js"
						]
					}
				},
				files: {
					'dist/index.html': 'index.html',
					'dist/404.html': '404.html',
					'dist/private-messages.html': 'private-messages.html',
					'dist/user.html': 'user.html',
					'dist/users-map.html': 'users-map.html'
				},
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-vulcanize');

	grunt.registerTask('build', ['requirejs', 'compass', 'vulcanize']);
	grunt.registerTask('w', ['build', 'watch']);
}