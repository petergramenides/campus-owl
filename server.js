const express = require('express');
const bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connection_url = "mongodb+srv://campusowl:danlikescheese@campusowl-vvljh.azure.mongodb.net/test";
const database_name = "rpi_media";

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

	bcrypt.genSalt(saltRounds, function(error, salt) {
	    bcrypt.hash(password, salt, function(error, hash) {
	    	var data = 
	    	{
	    		"uuid": uuidv4(),
	    		"username": username,
	    		"password": hash,
	    		"email": email,
	    		"first_name": first_name,
	    		"last_name": last_name,
	    		"birthday": birthday,
	    		"posts": [],
	    		"likes": [],
	    		"comments": [],
	    		"friends": []
	    	}
	    	collection.insertOne(data, (error, result) => {
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
        collection = database.collection("rpi");
        console.log("Connected to MongoDB Atlas Server hosted by Microsoft Azure.");
    });
});
