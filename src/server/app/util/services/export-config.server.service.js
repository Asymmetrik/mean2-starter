'use strict';

var
	path = require('path'),
	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,

	ExportConfig = dbs.admin.model('ExportConfig');

/**
 * ==========================================================
 * Public Methods
 * ==========================================================
 */

/**
 * Generate a new ExportConfig document in the collection. Returns a promise.
 */
module.exports.generateConfig = function(req) {
	var exportConfig = new ExportConfig(req.body);

	return exportConfig.save();
};

/**
 * Finds the requested export config from the collection.
 * Returns a Promise.
 */
module.exports.getConfigById = function(exportId) {
	return ExportConfig.findOne({_id: exportId}).exec();
};
