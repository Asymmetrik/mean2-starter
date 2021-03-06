'use strict';

let
	express = require('express'),
	path = require('path'),

	config = require(path.posix.resolve('./src/server/config.js')),
	logger = require(path.posix.resolve('./src/server/lib/bunyan.js')).logger,

	users = require(path.posix.resolve('./src/server/app/admin/controllers/users.server.controller.js'));


let router = express.Router();

/**
 * User Routes (don't require admin)
 */

// Self-service user routes
router.route('/user/me')
	.get( users.has(users.requiresLogin), users.getCurrentUser)
	.post(users.has(users.requiresLogin), users.updateCurrentUser);

// User getting another user's info
router.route('/user/:userId')
	.get(users.hasAccess, users.getUserById);

// User searching for other users
router.route('/users')
	.post(users.hasAccess, users.searchUsers);

// User match-based search for other users (this searches based on a fragment)
router.route('/users/match')
	.post(users.hasAccess, users.matchUsers);

/**
 * Admin User Routes (requires admin)
 */

// Admin retrieve/update/delete
router.route('/admin/user/:userId')
	.get(   users.hasAdminAccess, users.adminGetUser)
	.post(  users.hasAdminAccess, users.adminUpdateUser)
	.delete(users.hasAdminAccess, users.adminDeleteUser);

// Admin search users
router.route('/admin/users')
	.post(users.hasAdminAccess, users.adminSearchUsers);

// Get user CSV using the specifies config id
router.route('/admin/users/csv/:exportId')
	.get(users.hasAdminAccess, users.adminGetCSV);

// Admin retrieving a User field for all users in the system
router.route('/admin/users/getAll')
	.post(users.hasAdminAccess, users.adminGetAll);

/**
 * Auth-specific routes
 */
router.route('/auth/signin').post(users.signin);
router.route('/auth/signout')
	.get(users.has(users.requiresLogin), users.signout);

/**
 * Routes that only apply to the 'local' passport strategy
 */
if (config.auth.strategy === 'local') {

	logger.info('Configuring local user authentication routes.');

	// Admin Create User
	router.route('/admin/user')
		.post(users.hasAdminAccess, users.adminCreateUser);

	// Default setup is basic local auth
	router.route('/auth/signup').post(users.signup);

	router.route('/auth/forgot').post(users.forgot);
	router.route('/auth/reset/:token').get(users.validateResetToken);
	router.route('/auth/reset/:token').post(users.reset);

}
/**
 * Routes that only apply to the 'proxy-pki' passport strategy
 */
else if (config.auth.strategy === 'proxy-pki') {

	logger.info('Configuring proxy-pki user authentication routes.');

	// Admin Create User
	router.route('/admin/user')
		.post(users.hasAdminAccess, users.adminCreateUserPki);

	// DN passed via header from proxy
	router.route('/auth/signup').post(users.proxyPkiSignup);

}

// Finish by binding the user middleware
router.param('userId', users.userById);

module.exports = router;
