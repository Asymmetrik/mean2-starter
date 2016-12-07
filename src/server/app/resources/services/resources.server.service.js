'use strict';

let _ = require('lodash'),
	mongoose = require('mongoose'),
	path = require('path'),
	q = require('q'),

	deps = require(path.resolve('./src/server/dependencies.js')),
	dbs = deps.dbs,
	util = deps.utilService,
	Resource = dbs.admin.model('Resource'),
	Team = dbs.admin.model('Team'),
	User = dbs.admin.model('User'),

	teamsController = require(path.resolve('./src/server/app/teams/controllers/teams.server.controller.js'));

module.exports = function() {

	function populateOwnerInfo(search) {
		if (null == search.owner) {
			return q(search);
		}

		search = search.toObject();
		var id = _.isString(search.owner.id) ? mongoose.Types.ObjectId(search.owner.id) : search.owner.id;
		var findPromise = search.owner.type === 'team' ? Team.findOne({ _id: id }).exec() : User.findOne({ _id: id }).exec();

		return findPromise.then(function(ownerObj) {
			if (ownerObj != null) {
				search.owner.name = ownerObj.name;
			}
			return q(search);
		});
	}

	function populateMultiOwnerInfo(searches) {
		return q.all(searches.map((search) => populateOwnerInfo(search)));
	}

	function doSearch(query, sortParams, page, limit) {
		let offset = page * limit;

		return q.all([
				Resource.find(query).count(),
				Resource.find(query).sort(sortParams).skip(offset).limit(limit)
			])
			.then(function(results) {
				return q({
					totalSize: results[0],
					pageNumber: page,
					pageSize: limit,
					totalPages: Math.ceil(results[0]/limit),
					elements: results[1]
				});
			});
	}

	function searchResources(query, queryParams, user) {
		let page = util.getPage(queryParams);
		let limit = util.getLimit(queryParams, 1000);


		let sort = queryParams.sort;
		let dir = queryParams.dir;

		// Sort can be null, but if it's non-null, dir defaults to DESC
		if (null != sort && dir == null) { dir = 'ASC'; }

		let sortParams;
		if (null != sort) {
			sortParams = {};
			sortParams[sort] = dir === 'ASC' ? 1 : -1;
		}

		let searchPromise;
		// If user is not an admin, constrain the results to the user's teams
		if (null == user.roles || !user.roles.admin) {
			searchPromise = teamsController.filterTeamIds(user)
				.then(
					(teamIds) => {
						teamIds = teamIds.map((teamId) => {
							if (_.isString(teamId)) {
								return mongoose.Types.ObjectId(teamId);
							}
						});

						query.$or = [{'owner.type': 'team', 'owner.id': {$in: teamIds}}, {
							'owner.type': 'user',
							'owner.id': user._id
						}];

						return doSearch(query, sortParams, page, limit);
					});
		}
		else {
			searchPromise = doSearch(query, sortParams, page, limit);
		}

		return searchPromise.then(
			(results) => {
				return populateMultiOwnerInfo(results.elements).then(
					(populated) => {
						results.elements = populated;
						return q(results);
					});
			});
	}


	return {
		searchResources: searchResources
	};
};