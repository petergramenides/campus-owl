const express = require('express');
const bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
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

function add_page(owner, request, response)
{
	var name = String(request.query.name);
	var description = String(request.query.description);
	var date = String(request.query.date);

	var page =
	{
		"name": name,
		"description": description,
		"date": date,
		"owner": owner,
		"posts": {}
	}

	page_collection.insertOne(page, (error, result) => {
        if(error) {
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "error"});
        }
        console.log('result successfully saved.');
        response.header("X-Content-Type-Options", "nosniff");
		return response.jsonp({"success": "success"});
    });
}

// adds page to page_collection
app.get('/api/pages/add', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		} var owner = username;

		account_collection.findOne({ "username": owner })
			.then(account_data => {
				if (account_data)
				{
					page_collection.findOne({ "owner": owner })
					.then(page_data => {
						if (page_data == null)
						{
							add_page(owner, request, response);
						} else {
							console.log("Error duplicate page exists.")
				    		response.header("X-Content-Type-Options", "nosniff");
							return response.jsonp({"error": "error"});
						}
					}).catch(error => console.log("Error adding a new page."));
				} else {
		    	console.log("Error finding the username.")
		    	response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({"error": "error"});
		    }
		  }).catch(error => console.log("Error finding the username."));
	});
});

// logs out the user with session
app.get('/api/pages/delete', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		} var owner = username;
		var page = String(request.query.page);

		page_collection.findOne({ "owner": owner })
			.then(account_data => {
		    if(account_data) 
		    {
		    	page_collection.deleteOne({"name" : page}, function(error, obj) {
				    if (error)
				    {
				    	console.log("Could not delete page for username " + owner);
				    	response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({"error": "error"});
				    } else {
				    	console.log("Successfully deleted page for username " + owner);
				    	response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({"success": "success"});
				    }
			  });
		    } else {
		    	console.log("Error the owner does not match.")
		    	response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({"error": "error"});
		    }
		  }).catch(error => console.log("Error finding the username."));
	});
});

// edits the page information
app.get('/api/pages/edit', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var page = String(request.query.page);
		var current_owner = username;
		var owner = String(request.query.owner);
		var name = String(request.query.name);
		var description = String(request.query.description);
		var date = String(request.query.date);

		var updated_page =
		{
			"name": name,
			"description": description,
			"date": date,
			"owner": owner
		}

		account_collection.findOne({ "username": current_owner })
			.then(account_data => {
				var query = {"name": page};
				var new_data = { $set: updated_page };
				page_collection.updateOne(query, new_data, function(err, res) {
				    if (err) throw err;
				    console.log("Successfully updated the page " + page + " with new information.");
				    response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({"success": "success"});
				});
		  }).catch(error => console.log("Error finding the username."));
	});
});

function getUserInformation(session_id, callback)
{
	account_collection.find({}).toArray(function (err, result) {
        if (err) {
            console.log(err);
        } else {
        	var all_users = result;
        	for (var x = 0; x < all_users.length; ++x)
        	{
        		for (var y = 0; y < all_users[x].sessions.length; ++y)
        		{
        			var found = bcrypt.compareSync(session_id, all_users[x].sessions[y]);
        			if (found == true)
        			{
        				console.log(all_users[x].username);
        				callback(null, all_users[x].username);
        			}
        		}
        	}
        }
    });
}

// get user information from session id
app.get('/api/account/user', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		account_collection.find({}).toArray(function (err, result) {
	        if (err) {
	            console.log(err);
	        } else {
	        	var all_users = result;
	        	for (var x = 0; x < all_users.length; ++x)
	        	{
	        		for (var y = 0; y < all_users[x].sessions.length; ++y)
	        		{
	        			var found = bcrypt.compareSync(session_id, all_users[x].sessions[y]);
	        			if (found == true)
	        			{
	        				response.header("X-Content-Type-Options", "nosniff");
	   						return response.jsonp({"success": all_users[x].username});
	        			}
	        		}
	        	}
	        }
	    });
	});
});

function account_logout(session_id, sessions, request, response)
{
	var delete_index = -1;
	for (var x = 0; x < sessions.length; ++x)
	{
		var result = bcrypt.compareSync(session_id, sessions[x]);
		if (result == true)
		{
			delete_index = x;
		}
	}
	if (delete_index > -1) {
		sessions.splice(delete_index, 1);
	}
	account_collection.updateOne(
	   { "username": request.query.username },
	   {
	     $set: { "sessions": sessions },
	     $currentDate: { lastModified: true }
	   }
	);
	console.log("Successfully logged out user " + request.query.username);
	response.header("X-Content-Type-Options", "nosniff");
   	return response.jsonp({"success": "success"});
}

// logs user out with session_id
app.get('/api/account/logout', function(request, response)
{
	var session_id = String(request.query.session_id);
	var username = String(request.query.username);
	var sessions;
	account_collection.findOne({ "username": username })
		.then(account_data => {
	    if(account_data) {
	    	sessions = account_data.sessions;
	    	account_logout(session_id, sessions, request, response);
	    }
	  }).catch(error => console.log("Error finding the username."));
});

// logs in the user with session
app.get('/api/account/login', function(request, response)
{
	var username = String(request.query.username);
	var password = String(request.query.password);

	account_collection.findOne({ "username": username })
		.then(account_data => {
	    if(account_data) {
	    	bcrypt.genSalt(saltRounds, function(error, salt) {
		    	bcrypt.compare(password, account_data.password, function(err, result) {
				    if (result == true)
				    {
				    	console.log("The password is correct.")
				    	var session_id = uuidv4();
				    	bcrypt.hash(session_id, salt, function(error, hash) {
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
				    		return response.jsonp({"success": session_id});
						});
				    } else {
				    	console.log("The password or confirmation was incorrect.")
			    		response.header("X-Content-Type-Options", "nosniff");
			    		return response.jsonp({"error": "error"});
				    }
				});
			});
	    }
	  }).catch(error => console.log("Error finding the username."));
});

// removes a like to a post
app.get('/api/pages/posts/likes/delete', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);

		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
		    	var all_posts = result.posts;
		    	if (all_posts[post_id].likes.includes(username))
		    	{
		    		var updated_likes = [];
		    		for (var x = 0; x < all_posts[post_id].likes.length; ++x)
		    		{
		    			if (all_posts[post_id].likes[x] != username)
		    			{
		    				updated_likes.push(all_posts[post_id].likes[x]);
		    			}
		    		} all_posts[post_id].likes = updated_likes;
		    	} else {
		    		console.log("User " + username + " already unliked post " + post_id);
		    		return response.jsonp({"error": "error"});
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// returns all likes for a post
app.get('/api/pages/posts/likes', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);
		page_collection.findOne({ "name": page })
		.then(result => {
	    if(result) {
	    	var all_posts = result.posts;
	    	console.log("Successfully returned all likes from " + post_id + " on page " + page);
    		response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"success": all_posts[post_id].likes});
	    } else {
	    	console.log("Could not find data for page " + page);
	    	return response.jsonp({"error": "error"});
	    }
	  }).catch(err => console.log(err));
	});
});

// adds a like to a post
app.get('/api/pages/posts/likes/add', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);

		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
		    	var all_posts = result.posts;
		    	if (!all_posts[post_id].likes.includes(username))
		    	{
		    		all_posts[post_id].likes.push(username);
		    	} else {
		    		console.log("User " + username + " already liked post " + post_id);
		    		return response.jsonp({"error": "error"});
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// returns all comments
app.get('/api/pages/posts/comments', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);

		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
		    	var all_comments = result.posts[post_id].comments;
		    	var all_engagements = result.posts[post_id].engagements;
		    	var comments = 
		    	{
		    		"comments": all_comments,
		    		"engagements": all_engagements
		    	}
		    	console.log("Successfully return data from post_id " + post_id + " to page " + page);
	    		response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({"success": comments});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// deletes a comments
app.get('/api/pages/posts/comments/delete', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);
		var comment = String(request.query.comment);

		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
		    	var all_posts = result.posts;
		    	if (all_posts[post_id].comments.includes(comment))
		    	{
		    		var updated_comments = [];
		    		var updated_engagements = all_posts[post_id].engagements;
		    		var engagement_index = -1;
		    		for (var x = 0; x < all_posts[post_id].comments.length; ++x)
		    		{
		    			if (all_posts[post_id].comments[x] != comment)
		    			{
		    				updated_comments.push(all_posts[post_id].comments[x]);
		    				engagement_index = x;
		    			}
		    		} all_posts[post_id].comments = updated_comments;
		    	} else {
		    		console.log("User " + username + " already deleted comment for post " + post_id);
		    		return response.jsonp({"error": "error"});
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));

	});
});

// adds a comment
app.get('/api/pages/posts/comments/add', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);
		var comment = String(request.query.comment);

		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// edits a post on a page
app.get('/api/pages/posts/edit', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var time = String(request.query.time);
		var date = String(request.query.date);
		var type = String(request.query.type);
		var image = String(request.query.image);
		var text = String(request.query.text);
		var page = String(request.query.page);
		var post_id = String(request.query.post_id);

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
		    if(result) {
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// deletes a post
app.get('/api/pages/posts/delete', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var post_id = String(request.query.post_id);
		var page = String(request.query.page);
		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
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
				return response.jsonp({"success": "success"});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": "error"});
		    }
		  }).catch(err => console.log(err));
	});
});

// adds a post
app.get('/api/pages/posts/add', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var time = String(request.query.time);
		var date = String(request.query.date);
		var type = String(request.query.type);
		var image = String(request.query.image);
		var text = String(request.query.text);
		var page = String(request.query.page);
		var post_id = uuidv4();

		var post =
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
		    if(result) {
		    	var all_posts = result.posts;
		    	all_posts[post_id] = post;
		    	page_collection.updateOne({ "name" : page }
			    , { $set: { "posts" : all_posts } }, function(error, update_result) {
			    	if (error)
			    	{
			    		console.log("Something went wrong adding a post.");
			    		response.header("X-Content-Type-Options", "nosniff");
			    		return response.jsonp({"error": "error"});
			    	} else {
			    		console.log("Successfully added a new post for username " + username);
			    		response.header("X-Content-Type-Options", "nosniff");
						return response.jsonp({"success": "success"});
			    	}
			    });

		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": error});
		    }
		  }).catch(err => console.log(err));
	});
});

// gets all the posts for a page
app.get('/api/pages/posts', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var page = String(request.query.page);
		page_collection.findOne({ "name": page })
			.then(result => {
		    if(result) {
		    	var all_posts = result.posts;
		    	console.log("Successfully recieved all posts from page " + page);
	    		response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({"success": all_posts});
		    } else {
		    	console.log("Could not find data for page " + page);
		    	return response.jsonp({"error": error});
		    }
		  }).catch(err => console.log(err));
	});
});

// gets all the pages and posts
app.get('/api/pages', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		page_collection.find({}).toArray(function (err, result) {
	        if (err) {
	            return response.jsonp({"error": err});
	        } else {
	        	return response.jsonp({"success": result});
	        }
	    });
	});
});

// deletes a follower to the user
app.get('/api/account/followers/delete', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var follower = String(request.query.follower);

		account_collection.findOne({ "username": username })
		.then(result => {
	    if(result) {
	    	var followers = result.followers;
	    	if (followers.includes(follower))
	    	{
	    		var updated_followers = [];
	    		for (var x = 0; x < followers.length; ++x)
	    		{
	    			if (followers[x] != follower)
	    			{
	    				updated_followers.push(followers[x]);
	    			}
	    		} followers = updated_followers;
	    	} else {
	    		console.log("User " + follower + " already unfollowed " + username);
	    		return response.jsonp({"error": "error"});
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
			return response.jsonp({"success": "success"});
	    } else {
	    	console.log("Could not find data for page " + page);
	    	return response.jsonp({"error": "error"});
	    }
	  }).catch(err => console.log(err));
	});
});

// adds a follower to the user
app.get('/api/account/followers/add', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		var follower = String(request.query.follower);

		account_collection.findOne({ "username": username })
		.then(result => {
	    if(result) {
	    	var followers = result.followers;
	    	if (!followers.includes(follower))
	    	{
	    		followers.push(follower);
	    	} else {
	    		console.log("User " + username + " already followed by " + follower);
	    		return response.jsonp({"error": "error"});
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
			return response.jsonp({"success": "success"});
	    } else {
	    	console.log("Could not find data for page " + page);
	    	return response.jsonp({"error": "error"});
	    }
	  }).catch(err => console.log(err));

	});
});

// gets all the account information
app.get('/api/account', function(request, response)
{
	Sync(function(){
		var session_id = String(request.query.session_id);
		var username = getUserInformation.sync(null, session_id);
		if (username == undefined)
		{
			response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "session does not exist."});	
		}
		console.log("Fetching all account information for username " + username);
		account_collection.findOne({ "username": username })
			.then(result => {
		    if(result) {
		    	console.log("The username '" + username + "' has been found.")
		    	response.header("X-Content-Type-Options", "nosniff");
		    	return response.jsonp({"success": result});
		    } else {
		    	console.log("Could not find data for username " + username);
		    	return response.jsonp({"error": error});
		    }
		}).catch(err => console.log("Error with username fetch."));
	});
});

function delete_account(username, response)
{
	account_collection.deleteOne({"username" : username}, function(error, obj) {
	    if (error)
	    {
	    	console.log("Could not delete account with username " + username);
	    	response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"error": "error"});
	    } else {
	    	console.log("Successfully deleted account with username " + username);
	    	response.header("X-Content-Type-Options", "nosniff");
			return response.jsonp({"success": "success"});
	    }
  });
}

// deletes the account given the username, password, and
// the word "delete"
app.get('/api/account/delete', function(request, response)
{
	console.log("Deleted a user account.");
	var username = String(request.query.username);
	var password = String(request.query.password);
	var confirmation = String(request.query.confirmation);
	account_collection.findOne({ "username": username })
		.then(account_data => {
	    if(account_data) {
	    	bcrypt.compare(password, account_data.password, function(err, result) {
			    if (result == true && confirmation.toLowerCase() == "delete")
			    {
			    	console.log("The password is correct.")
			    	delete_account(username, response);
			    } else {
			    	console.log("The password or confirmation was incorrect.")
		    		response.header("X-Content-Type-Options", "nosniff");
		    		return response.jsonp({"error": "error"});
			    }
			});
	    }
	  }).catch(error => console.log("Error finding the username."));
});

function change_password(username, new_password, response)
{
	bcrypt.genSalt(saltRounds, function(error, salt) {
	    bcrypt.hash(new_password, salt, function(error, hash) {
	    	account_collection.updateOne({ "username" : username }
		    , { $set: { "password" : hash } }, function(error, result) {
		    	if (error)
		    	{
		    		console.log("Something went wrong changing the password.");
		    		response.header("X-Content-Type-Options", "nosniff");
		    		return response.jsonp({"error": "error"});
		    	} else {
		    		console.log("Successfully changed the password");
		    		response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({"success": "success"});
		    	}
		    });
		});
	});
}

// gets username, old password, new password and changes the password
app.get('/api/account/change/password', function(request, response)
{
	console.log("Changing the old password.");
	var username = String(request.query.username);
	var old_password = String(request.query.old_password);
	var new_password = String(request.query.new_password);

	account_collection.findOne({ "username": username })
		.then(account_data => {
	    if(account_data) {
	    	bcrypt.compare(old_password, account_data.password, function(err, result) {
			    if (result == true)
			    {
			    	console.log("The password is correct.")
			    	bcrypt.compare(new_password, account_data.password, function(err, result2) {
			    		if (result2 == true)
			    		{
			    			console.log("The new password is the same as the old password.");
		    				response.header("X-Content-Type-Options", "nosniff");
		    				return response.jsonp({"error": "error"});
			    		} else {
			    			console.log("The new password is unique");
			    			change_password(username, new_password, response);
			    		}
			    	});
			    } else {
			    	console.log("The password is incorrect.")
		    		response.header("X-Content-Type-Options", "nosniff");
		    		return response.jsonp({"error": "error"});
			    }
			});
	    }
	  }).catch(error => console.log("Error finding the username."));
});

function create_account(request, response)
{
	var username = String(request.query.username);
	var password = String(request.query.password);
	var email = String(request.query.email);
	var first_name = String(request.query.first_name);
	var last_name = String(request.query.last_name);
	var birthday = String(request.query.birthday);

	bcrypt.genSalt(saltRounds, function(error, salt) {
	    bcrypt.hash(password, salt, function(error, hash) {
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
		        if(error) {
		        	console.log("error");
					response.header("X-Content-Type-Options", "nosniff");
					return response.jsonp({"error": "error"});
		        }
		        console.log('result successfully saved.');
		        response.header("X-Content-Type-Options", "nosniff");
				return response.jsonp({"success": "success"});
		    });
	    });
	});
}

app.get('/api/account/create', function(request, response)
{
	console.log("Creating new account.");
	var username = String(request.query.username);
	var password = String(request.query.password);
	var email = String(request.query.email);
	var first_name = String(request.query.first_name);
	var last_name = String(request.query.last_name);
	var birthday = String(request.query.birthday);

	if (typeof username === "undefined" || typeof password === "undefined"
		|| typeof email === "undefined" || typeof first_name === "undefined"
		|| typeof last_name === "undefined" || typeof birthday === "undefined")
	{
		console.log("error");
		response.header("X-Content-Type-Options", "nosniff");
		return response.jsonp({"error": "error"});
	}

	account_collection.findOne({ "username": username })
		.then(result => {
	    if(result) {
	    	console.log("The username '" + username + "' already exists.")
	    	response.header("X-Content-Type-Options", "nosniff");
	    	return response.jsonp({"error": "error"});
	    } else {
	    	console.log("The username '" + username + "' is unique.");
	    	account_collection.findOne({ "email": email })
			.then(result => {
		    if(result) {
		    	console.log("The email '" + email + "' already exists.")
		    	response.header("X-Content-Type-Options", "nosniff");
		    	return response.jsonp({"error": "error"});
		    } else {
		    	console.log("The email '" + email + "' is unique.");
		    	create_account(request, response);
		    }
		  }).catch(err => console.log("Error with email fetch."));
	    }
	  }).catch(err => console.log("Error with username fetch."));
});

// serve the node backend on port 3000
app.listen(3000, function(){
  console.log("Server up on port 3000...");
  // securely connects server to mongodb database and sets collection
  mongodb.connect(connection_url, { useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(database_name);
        account_collection = database.collection("users");
        page_collection = database.collection("pages");
        console.log("Connected to MongoDB Atlas Server hosted by Microsoft Azure.");
    });
});
