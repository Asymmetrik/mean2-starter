'use strict';

var path = require('path'),
	_ = require('lodash'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,
	pjson = require(path.resolve('./package.json'));


var getSystemConfig = function() {
	var toReturn = {

		auth: config.auth.strategy,
		app: config.app,
		requiredRoles: config.auth.requiredRoles,

		clientEnableProdMode: config.clientEnableProdMode,

		version: pjson.version,
		banner: config.banner,
		copyright: config.copyright,

		defaultImage: config.defaultImage,

		map: config.map,
		urlHandler: config.urlHandler,
		mailer: _.pick(config.mailer, 'admin'),

		maxScan: config.maxScan,
		maxExport: config.maxExport,
		notifications: config.notifications,
		sourcing: config.sourcing,

		welcomeLinks: config.welcomeLinks
	};

	return toReturn;
};

exports.getSystemConfig = getSystemConfig;

// Read
exports.read = function(req, res) {
	/**
	 *  Add unsecured configuration data
	 */
	res.json(getSystemConfig());
};
