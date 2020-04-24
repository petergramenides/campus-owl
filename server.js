const express = require('express');
const bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
var session = require('express-session');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connection_url = "mongodb+srv://campusowl:danlikescheese@campusowl-vvljh.azure.mongodb.net/test";
const database_name = "rpi_media";

const bcrypt = require('bcrypt');
const saltRounds = 10;

function add_page(request, response)
{
	var name = String(request.query.name);
	var description = String(request.query.description);
	var date = String(request.query.date);
	var owner = String(request.query.owner);

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

// TODO: logo out the user with session
app.get('/api/pages/add', function(request, response)
{
	var owner = String(request.query.owner);

	account_collection.findOne({ "username": owner })
		.then(account_data => {
			if (account_data)
			{
				page_collection.findOne({ "owner": owner })
				.then(page_data => {
					if (page_data == null)
					{
						add_page(request, response);
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

// logs out the user with session
app.get('/api/pages/delete', function(request, response)
{
	var page = String(request.query.page);
	var owner = String(request.query.owner);

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

// logs out the user with session
app.get('/api/pages/edit', function(request, response)
{
	var page = String(request.query.page);
	var current_owner = String(request.query.current_owner);
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

// logs out the user with session
app.get('/api/account/logout', function(request, response)
{

});

// logs in the user with session
app.get('/api/account/login', function(request, response)
{

});

// removes a like to a post
app.get('/api/pages/likes/delete', function(request, response)
{

});

// adds a like to a post
app.get('/api/pages/likes/add', function(request, response)
{

});

// returns all likes
app.get('/api/pages/likes', function(request, response)
{

});

// returns all comments
app.get('/api/pages/comments', function(request, response)
{

});

// edits a comment
app.get('/api/pages/comments/edit', function(request, response)
{

});


// deletes a comments
app.get('/api/pages/comments/delete', function(request, response)
{

});

// adds a comment
app.get('/api/pages/comments/add', function(request, response)
{

});

// edits a post, TODO: implement likes and comments
app.get('/api/pages/posts/edit', function(request, response)
{
	var username = String(request.query.username);
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
		"likes": {},
		"comments": {}
	}

	page_collection.findOne({ "name": page })
		.then(result => {
	    if(result) {
	    	var all_posts = result.posts;
	    	//var likes = result.posts.post_id.likes;
	    	//var comments = result.posts.post_id.comments;
	    	all_posts[post_id] = updated_post;
	    	console.log(all_posts);
	    	//all_posts[post_id].comments = comments;
	    	//all_posts[post_id].likes = likes;
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

// deletes a post
app.get('/api/pages/posts/delete', function(request, response)
{
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

// adds a post
app.get('/api/pages/posts/add', function(request, response)
{
	var username = String(request.query.username);
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
		"likes": {},
		"comments": {}
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

// gets all the posts for a page
app.get('/api/pages/posts', function(request, response)
{
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

// gets all the posts for a user
app.get('/api/account/posts', function(request, response)
{


});

// deletes a friend
app.get('/api/account/friends/delete', function(request, response)
{

});

// adds a friend
app.get('/api/account/friends/add', function(request, response)
{

});

// gets all the friends
app.get('/api/account/friends', function(request, response)
{
});	
// gets all the account information
app.get('/api/account', function(request, response)
{
	var username = String(request.query.username);
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
	    		"friends": {}
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

// creates a new account, TODO: check if account/email already exists
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
