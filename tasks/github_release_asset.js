/*
 * grunt-github-release-asset
 * https://github.com/bartinger/grunt-github-release-asset
 *
 * Copyright (c) 2014 Dominic Bartl
 * Licensed under the MIT license.
 */

'use strict';


var format = require('string-template');
var async = require('async');
var Github = require('./lib/github.js');
module.exports = function (grunt) {

	// Please see the Grunt documentation for more information regarding task
	// creation: http://gruntjs.com/creating-tasks

	grunt.registerTask('githubAsset', 'Attach assets to Girhub releases.', function (args) {
		// Merge task-specific and/or target-specific options with these defaults.
		var done = this.async();
		var options = this.options({
			releaseName: '{tag}'
		});
		var hub = new Github(options);
		if (!options.file) {
			grunt.fail.fatal('No file specified.');
		}
		async.waterfall([

			function (callback) {
				hub.getLatestTag(callback);
			},
			function (body, callback) {
				if (body.length == 0) {
					grunt.fail.fatal('No tag was found.');
				}
				var tag = body[0].name;

				var releaseName = format(options.releaseName, {
					tag: tag
				});
				grunt.log.ok('Create release "' + releaseName + '" on tag: ' + tag);
				hub.createRelease(tag, releaseName, '', callback);
			},
			function (body, callback) {
				if (body.errors) {
					var msg = body.message + (body.errors.length > 0? '(' + body.errors[0].code + ')' : '')
					grunt.fail.fatal(msg);
				}
				grunt.log.ok('Uploading asset: ' + options.file + '...');
				hub.uploadAsset(body.id, options.file, callback);
			},
			function (body, callback) {
				grunt.log.ok('Upload successful.');
				callback(null, body);
			}
		], function (err, result) {
			if (err) {
				grunt.fail.fatal(err);
			}
			done();
		});
	});

};