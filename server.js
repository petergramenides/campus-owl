const express = require('express');
const bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
const mongo = require('mongodb');
var session = require('express-session');
var Sync = require('sync');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connection_url = "mongodb+srv://campusowl:danlikescheese@campusowl-vvljh.azure.mongodb.net/test";
const database_name = "rpi_media";

const bcrypt = require('bcrypt');
const saltRounds = 10;

function add_page(owner, request, response) {
	var name = String(request.body.pageName);
	var description = String(request.body.description);
	var date = String(request.body.date);

	var page =
	{
		"name": name,
		"description": description,
		"date": date,
		"owner": owner,
		"posts": {}
	}

	page_collection.insertOne(page, (error, result) => {
		if (error) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "issue adding page to database." });
		}
		console.log('result successfully saved.');
		response.header("X-Content-Type-Options", "nosniff");
		return response.jsonp({ "success": "added page." });
	});
}

// gets all the pages and posts
app.get('/api/pages', function (request, response) {
	page_collection.find({}).toArray(function (err, result) {
		if (err) {
			return response.jsonp({ "error": err });
		} else {
			return response.jsonp({ "success": result });
		}
	});
});

// adds page to page_collection
app.post('/api/pages/add', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		} var owner = username;

		account_collection.findOne({ "username": owner })
			.then(account_data => {
				if (account_data) {
					page_collection.findOne({ "owner": owner })
						.then(page_data => {
							add_page(owner, request, response);
						}).catch(error => console.log("Error adding a new page."));
				} else {
					console.log("Error finding the username.")
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "error": "could not find matching username." });
				}
			}).catch(error => console.log("Error finding the username."));
	});
});

// deletes the page from page_collection
app.delete('/api/pages/delete', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		} var owner = username;
		var page = String(request.body.page);

		page_collection.findOne({ "owner": owner })
			.then(account_data => {
				if (account_data) {
					page_collection.deleteOne({ "name": page }, function (error, obj) {
						if (error) {
							console.log("Could not delete page for username " + owner);
							response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({ "error": "could not delete page for user." });
						} else {
							console.log("Successfully deleted page for username " + owner);
							response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({ "success": "deleted page for user." });
						}
					});
				} else {
					console.log("Error the owner does not match.")
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "error": "the owner does not match." });
				}
			}).catch(error => console.log("Error finding the username."));
	});
});

// edits the page information
app.put('/api/pages/edit', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var page = String(request.body.page);
		var current_owner = username;
		var owner = String(request.body.owner);
		var name = String(request.body.name);
		var description = String(request.body.description);
		var date = String(request.body.date);

		var updated_page =
		{
			"name": name,
			"description": description,
			"date": date,
			"owner": owner
		}

		account_collection.findOne({ "username": current_owner })
			.then(account_data => {
				var query = { "name": page };
				var new_data = { $set: updated_page };
				page_collection.updateOne(query, new_data, function (err, res) {
					if (err) throw err;
					console.log("Successfully updated the page " + page + " with new information.");
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "edited page." });
				});
			}).catch(error => console.log("Error finding the username."));
	});
});

// removes a like to a post
app.delete('/api/pages/posts/likes/delete', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					if (all_posts[post_id].likes.includes(username)) {
						var updated_likes = [];
						for (var x = 0; x < all_posts[post_id].likes.length; ++x) {
							if (all_posts[post_id].likes[x] != username) {
								updated_likes.push(all_posts[post_id].likes[x]);
							}
						} all_posts[post_id].likes = updated_likes;
					} else {
						console.log("User " + username + " already unliked post " + post_id);
						return response.jsonp({ "error": "user already unliked post." });
					}
					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log(username + " successfully unliked post " + post_id + " on page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "unliked post." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// returns all likes for a post
app.get('/api/pages/posts/likes', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);
		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					console.log("Successfully returned all likes from " + post_id + " on page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": all_posts[post_id].likes });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// adds a like to a post
app.post('/api/pages/posts/likes/add', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					if (!all_posts[post_id].likes.includes(username)) {
						all_posts[post_id].likes.push(username);
					} else {
						console.log("User " + username + " already liked post " + post_id);
						return response.jsonp({ "error": "user already liked post." });
					}
					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log("Successfully added like from user " + username + " to post " + post_id + " on page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "added like." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// returns all comments
app.get('/api/pages/posts/comments', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_comments = result.posts[post_id].comments;
					var all_engagements = result.posts[post_id].engagements;
					var comments =
					{
						"comments": all_comments,
						"engagements": all_engagements
					}
					console.log("Successfully return data from post_id " + post_id + " to page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": comments });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// deletes a comments
app.delete('/api/pages/posts/comments/delete', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);
		var comment = String(request.body.comment);

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					if (all_posts[post_id].comments.includes(comment)) {
						var updated_comments = [];
						var updated_engagements = all_posts[post_id].engagements;
						var engagement_index = -1;
						for (var x = 0; x < all_posts[post_id].comments.length; ++x) {
							if (all_posts[post_id].comments[x] != comment) {
								updated_comments.push(all_posts[post_id].comments[x]);
								engagement_index = x;
							}
						} all_posts[post_id].comments = updated_comments;
					} else {
						console.log("User " + username + " already deleted comment for post " + post_id);
						return response.jsonp({ "error": "user already deleted comment." });
					}

					if (engagement_index > -1) {
						updated_engagements.splice(engagement_index, 1);
					} all_posts[post_id].engagements = updated_engagements;

					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log(username + " successfully removed comment from post " + post_id + " on page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "removed comment." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));

	});
});

// adds a comment
app.post('/api/pages/posts/comments/add', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);
		var comment = String(request.body.comment);

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					all_posts[post_id].engagements.push(username);
					all_posts[post_id].comments.push(comment);
					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log("Successfully added comment from user " + username + " to post " + post_id + " on page " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "added comment." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// edits a post on a page
app.put('/api/pages/posts/edit', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var time = String(request.body.time);
		var date = String(request.body.date);
		var type = String(request.body.type);
		var image = String(request.body.image);
		var text = String(request.body.text);
		var page = String(request.body.page);
		var post_id = String(request.body.post_id);

		var updated_post =
		{
			"username": username,
			"time": time,
			"date": date,
			"type": type,
			"image": image,
			"text": text,
			"page": page,
			"likes": [],
			"comments": [],
			"engagements": []
		}

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					var likes = result.posts.post_id.likes;
					var comments = result.posts.post_id.comments;
					var engagements = result.posts.post_id.engagements;
					all_posts[post_id] = updated_post;
					console.log(all_posts);
					all_posts[post_id].comments = comments;
					all_posts[post_id].engagements = engagements;
					all_posts[post_id].likes = likes;
					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log("Successfully deleted post from " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "deleted post." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// deletes a post
app.delete('/api/pages/posts/delete', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var post_id = String(request.body.post_id);
		var page = String(request.body.page);
		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					delete all_posts[post_id];
					page_collection.updateOne(
						{ "name": page },
						{
							$set: { "posts": all_posts },
							$currentDate: { lastModified: true }
						}
					);
					console.log("Successfully deleted post from " + page);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "deleted post." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// adds a post
app.post('/api/pages/posts/add', function (request, response) {
	Sync(function () {
		var date = String(request.body.date);
		var text = String(request.body.text);
		var post_id = uuidv4();

		var post =
		{
			"username": username,
			"date": date,
			"text": text,
			"likes": [],
			"comments": [],
			"engagements": []
		}

		page_collection.findOne({ "name": page })
			.then(result => {
				if (result) {
					var all_posts = result.posts;
					all_posts[post_id] = post;
					page_collection.updateOne({ "name": page }
						, { $set: { "posts": all_posts } }, function (error, update_result) {
							if (error) {
								console.log("Something went wrong adding a post.");
								response.header("X-Content-Type-Options", "nosniff");
								return response.jsonp({ "error": "something went wrong adding a post." });
							} else {
								console.log("Successfully added a new post for username " + username);
								response.header("X-Content-Type-Options", "nosniff");
								return response.jsonp({ "success": "added a new post for user." });
							}
						});

				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": error });
				}
			}).catch(err => console.log(err));
	});
});

// gets all the posts for a page
app.get('/api/pages/posts/:id', function (request, response) {
	let id = String(request.params.id);
	let o_id = new mongo.ObjectID(id)
	page_collection.findOne({ '_id': o_id })
		.then(result => {
			console.log(result);
			if (result) {
				let all_posts = result.posts;
				console.log("Successfully recieved all posts from page " + result.name);
				response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({ "success": all_posts });
			} else {
				console.log("Could not find data for page " + result.name);
				return response.jsonp({ "error": error });
			}
		}).catch(err => console.log(err));
});

// gets all the account information
app.get('/api/account', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		console.log("Fetching all account information for username " + username);
		account_collection.findOne({ "username": username })
			.then(result => {
				if (result) {
					console.log("The username '" + username + "' has been found.")
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": result });
				} else {
					console.log("Could not find data for username " + username);
					return response.jsonp({ "error": error });
				}
			}).catch(err => console.log("Error with username fetch."));
	});
});

function delete_account(username, response) {
	account_collection.deleteOne({ "username": username }, function (error, obj) {
		if (error) {
			console.log("Could not delete account with username " + username);
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "could not delete account." });
		} else {
			console.log("Successfully deleted account with username " + username);
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "success": "deleted account." });
		}
	});
}

// deletes the account given the username, password, and
// the word "delete"
app.delete('/api/account/delete', function (request, response) {
	console.log("Deleted a user account.");
	var username = String(request.body.username);
	var password = String(request.body.password);
	var confirmation = String(request.body.confirmation);
	account_collection.findOne({ "username": username })
		.then(account_data => {
			if (account_data) {
				bcrypt.compare(password, account_data.password, function (err, result) {
					if (result == true && confirmation.toLowerCase() == "delete") {
						console.log("The password is correct.")
						delete_account(username, response);
					} else {
						console.log("The password or confirmation was incorrect.")
						response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({ "error": "the password, username, or confirmation was incorrect." });
					}
				});
			}
		}).catch(error => console.log("Error finding the username."));
});

function change_password(username, new_password, response) {
	bcrypt.genSalt(saltRounds, function (error, salt) {
		bcrypt.hash(new_password, salt, function (error, hash) {
			account_collection.updateOne({ "username": username }
				, { $set: { "password": hash } }, function (error, result) {
					if (error) {
						console.log("Something went wrong changing the password.");
						response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({ "error": "something went wrong changing the password." });
					} else {
						console.log("Successfully changed the password");
						response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({ "success": "changed password." });
					}
				});
		});
	});
}

// gets username, old password, new password and changes the password
app.put('/api/account/change/password', function (request, response) {
	console.log("Changing the old password.");
	var username = String(request.body.username);
	var old_password = String(request.body.old_password);
	var new_password = String(request.body.new_password);

	account_collection.findOne({ "username": username })
		.then(account_data => {
			if (account_data) {
				bcrypt.compare(old_password, account_data.password, function (err, result) {
					if (result == true) {
						console.log("The password is correct.")
						bcrypt.compare(new_password, account_data.password, function (err, result2) {
							if (result2 == true) {
								console.log("The new password is the same as the old password.");
								response.header("X-Content-Type-Options", "nosniff");
								return response.jsonp({ "error": "the new password is the same as the old password." });
							} else {
								console.log("The new password is unique");
								change_password(username, new_password, response);
							}
						});
					} else {
						console.log("The password is incorrect.")
						response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({ "error": "the password or username is incorrect." });
					}
				});
			}
		}).catch(error => console.log("Error finding the username."));
});

function create_account(request, response) {
	var username = String(request.body.username);
	var password = String(request.body.password);
	var email = String(request.body.email);
	var first_name = String(request.body.first_name);
	var last_name = String(request.body.last_name);
	var birthday = String(request.body.birthday);

	bcrypt.genSalt(saltRounds, function (error, salt) {
		bcrypt.hash(password, salt, function (error, hash) {
			var data =
			{
				"username": username,
				"password": hash,
				"email": email,
				"first_name": first_name,
				"last_name": last_name,
				"birthday": birthday,
				"sessions": [],
				"followers": []
			}
			account_collection.insertOne(data, (error, result) => {
				if (error) {
					console.log("error");
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "error": "error inserting account into database." });
				}
				console.log('result successfully saved.');
				response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({ "success": "added account." });
			});
		});
	});
}

app.post('/api/account/create', function (request, response) {
	console.log("Creating new account.");
	var username = String(request.body.username);
	var password = String(request.body.password);
	var email = String(request.body.email);
	var first_name = String(request.body.first_name);
	var last_name = String(request.body.last_name);
	var birthday = String(request.body.birthday);

	if (typeof username === "undefined" || typeof password === "undefined"
		|| typeof email === "undefined" || typeof first_name === "undefined"
		|| typeof last_name === "undefined" || typeof birthday === "undefined") {
		console.log("error");
		response.header("X-Content-Type-Options", "nosniff");
		return response.jsonp({ "error": "input parameters not defined." });
	}

	account_collection.findOne({ "username": username })
		.then(result => {
			if (result) {
				console.log("The username '" + username + "' already exists.")
				response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({ "error": "username already exists." });
			} else {
				console.log("The username '" + username + "' is unique.");
				account_collection.findOne({ "email": email })
					.then(result => {
						if (result) {
							console.log("The email '" + email + "' already exists.")
							response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({ "error": "email already exists." });
						} else {
							console.log("The email '" + email + "' is unique.");
							create_account(request, response);
						}
					}).catch(err => console.log("Error with email fetch."));
			}
		}).catch(err => console.log("Error with username fetch."));
});

// deletes a follower to the user
app.delete('/api/account/followers/delete', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var follower = String(request.body.follower);

		account_collection.findOne({ "username": username })
			.then(result => {
				if (result) {
					var followers = result.followers;
					if (followers.includes(follower)) {
						var updated_followers = [];
						for (var x = 0; x < followers.length; ++x) {
							if (followers[x] != follower) {
								updated_followers.push(followers[x]);
							}
						} followers = updated_followers;
					} else {
						console.log("User " + follower + " already unfollowed " + username);
						return response.jsonp({ "error": "user already unfollowed." });
					}
					account_collection.updateOne(
						{ "username": username },
						{
							$set: { "followers": followers },
							$currentDate: { lastModified: true }
						}
					);
					console.log(follower + " successfully unfollowed user " + username);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "unfollowed user." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));
	});
});

// adds a follower to the user
app.post('/api/account/followers/add', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		var follower = String(request.body.follower);

		account_collection.findOne({ "username": username })
			.then(result => {
				if (result) {
					var followers = result.followers;
					if (!followers.includes(follower)) {
						followers.push(follower);
					} else {
						console.log("User " + username + " already followed by " + follower);
						return response.jsonp({ "error": "user already followed." });
					}
					account_collection.updateOne(
						{ "username": username },
						{
							$set: { "followers": followers },
							$currentDate: { lastModified: true }
						}
					);
					console.log("Successfully added follower " + follower + " to user " + username);
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({ "success": "added follower." });
				} else {
					console.log("Could not find data for page " + page);
					return response.jsonp({ "error": "could not find data for page." });
				}
			}).catch(err => console.log(err));

	});
});

function getUserInformation(session_id, callback) {
	account_collection.find({}).toArray(function (err, result) {
		if (err) {
			console.log(err);
		} else {
			var all_users = result;
			for (var x = 0; x < all_users.length; ++x) {
				for (var y = 0; y < all_users[x].sessions.length; ++y) {
					var found = bcrypt.compareSync(session_id, all_users[x].sessions[y]);
					if (found == true) {
						console.log(all_users[x].username);
						callback(null, all_users[x].username);
					}
				}
			}
		}
	});
}

// get user information from session id
app.get('/api/account/user', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({ "error": "session does not exist." });
		}
		account_collection.find({}).toArray(function (err, result) {
			if (err) {
				console.log(err);
			} else {
				var all_users = result;
				for (var x = 0; x < all_users.length; ++x) {
					for (var y = 0; y < all_users[x].sessions.length; ++y) {
						var found = bcrypt.compareSync(session_id, all_users[x].sessions[y]);
						if (found == true) {
							response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({ "success": all_users[x].username });
						}
					}
				}
			}
		});
	});
});

function account_logout(session_id, sessions, request, response) {
	var delete_index = -1;
	for (var x = 0; x < sessions.length; ++x) {
		var result = bcrypt.compareSync(session_id, sessions[x]);
		if (result == true) {
			delete_index = x;
		}
	}
	if (delete_index > -1) {
		sessions.splice(delete_index, 1);
	}
	account_collection.updateOne(
		{ "username": request.body.username },
		{
			$set: { "sessions": sessions },
			$currentDate: { lastModified: true }
		}
	);
	console.log("Successfully logged out user " + request.body.username);
	response.header("X-Content-Type-Options", "nosniff");
	return response.jsonp({ "success": "logged out user." });
}

// logs user out with session_id
app.post('/api/account/logout', function (request, response) {
	Sync(function () {
		var session_id = String(request.body.session_id);
		var username = getUserInformation.sync(null, session_id);
		var sessions;
		account_collection.findOne({ "username": username })
			.then(account_data => {
				if (account_data) {
					sessions = account_data.sessions;
					account_logout(session_id, sessions, request, response);
				}
			}).catch(error => console.log("Error finding the username."));
	});
});

// logs in the user with session
app.post('/api/account/login', function (request, response) {
	var username = String(request.body.username);
	var password = String(request.body.password);

	account_collection.findOne({ "username": username })
		.then(account_data => {
			if (account_data) {
				bcrypt.genSalt(saltRounds, function (error, salt) {
					bcrypt.compare(password, account_data.password, function (err, result) {
						if (result == true) {
							console.log("The password is correct.")
							var session_id = uuidv4();
							bcrypt.hash(session_id, salt, function (error, hash) {
								var sessions = account_data.sessions;
								sessions.push(hash);
								account_collection.updateOne(
									{ "username": username },
									{
										$set: { "sessions": sessions },
										$currentDate: { lastModified: true }
									}
								);
								console.log("Successfully logged in " + username + " with new session.");
								response.header("X-Content-Type-Options", "nosniff");
								return response.jsonp({ "success": session_id, "username": username });
							});
						} else {
							console.log("The password or confirmation was incorrect.")
							response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({ "error": "password, username, or confirmation was incorrect" });
						}
					});
				});
			}
		}).catch(error => console.log("Error finding the username."));
});

// serve the node backend on port 3000
app.listen(3000, function () {
	console.log("Server up on port 3000...");
	// securely connects server to mongodb database and sets collection
	mongodb.connect(connection_url, { useUnifiedTopology: true }, (error, client) => {
		if (error) {
			throw error;
		}
		database = client.db(database_name);
		account_collection = database.collection("users");
		page_collection = database.collection("pages");
		console.log("Connected to MongoDB Atlas Server hosted by Microsoft Azure.");
	});
});
