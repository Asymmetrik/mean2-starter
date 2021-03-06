'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	path = require('path'),
	should = require('should'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	config = deps.config,

	userAuthenticationService = require(path.resolve('./src/server/app/admin/services/users.authentication.server.service.js'));

/**
 * Helpers
 */

var testDefaultRoles = {
	'test-role-1': true,
	'test-role-2': true,
	'test-role-3': false
};

function userSpec(key) {
	return {
		name: key + ' Name',
		email: key + '@mail.com',
		username: key + '_username',
		password: 'password',
		provider: 'local',
		organization: key + ' Organization'
	};
}

function validateDefaultRoles(updatedUser) {
	var keys = _.keys(testDefaultRoles);

	should.exist(updatedUser.roles);

	_.forEach(keys, (key) => {
		should(updatedUser.roles[key]).equal(testDefaultRoles[key]);
	});

	return q(updatedUser);

}

/**
 * Unit tests
 */
describe('User Authentication Service:', () => {

	var originalDefaultRoles;

	before(() => {
		originalDefaultRoles = config.auth.defaultRoles;
		config.auth.defaultRoles = testDefaultRoles;
	});

	after(() => {
		config.auth.defaultRoles = originalDefaultRoles;
	});

	describe('initializeNewUser', () => {

		it('should set default roles when none are initially set', (done) => {
			var user = userSpec('Basic');
			userAuthenticationService.initializeNewUser(user)
				.then(validateDefaultRoles)
				.then(() => { done(); })
				.catch(done);
		});

		it('should set default roles when set to an empty object', (done) => {
			var user = userSpec('Basic');
			user.roles = {};
			userAuthenticationService.initializeNewUser(user)
				.then(validateDefaultRoles)
				.then(() => { done(); })
				.catch(done);
		});

		it('should set default roles in addition to existing', (done) => {
			var user = userSpec('Basic');
			user.roles = { admin: false, editor: true };
			userAuthenticationService.initializeNewUser(user)
				.then(validateDefaultRoles)
				.then((updatedUser) => {
					should(updatedUser.roles.admin).equal(false);
					should(updatedUser.roles.editor).equal(true);
				})
				.then(() => { done(); })
				.catch(done);
		});

		it('should not override existing roles', (done) => {
			var user = userSpec('Basic');

			user.roles = _.clone(testDefaultRoles);
			// reverse the boolean value of each default role
			_.forEach(_.keys(testDefaultRoles), (key) => {
				user.roles[key] = !user.roles[key];
			});
			user.roles.admin = false;
			user.roles.editor = true;

			userAuthenticationService.initializeNewUser(user)
				.then((updatedUser) => {
					_.forEach(_.keys(testDefaultRoles), (key) => {
						should(user.roles[key]).equal(!testDefaultRoles[key]);
					});
					should(updatedUser.roles.admin).equal(false);
					should(updatedUser.roles.editor).equal(true);
				})
				.then(() => { done(); })
				.catch(done);
		});

	});

});
