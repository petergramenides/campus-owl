const express = require('express');
const bodyParser = require('body-parser');
var mongodb = require('mongodb').MongoClient;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const connection_url = "mongodb+srv://campusowl:danlikescheese@campusowl-vvljh.azure.mongodb.net/test";
const database_name = "rpi_media";

function get_db(uuid, response)
{
	collection.findOne({ "id": uuid })
	.then(result => {
    if(result) {
    	console.log("successfully pulled file from database.");
    	delete result["_id"];
    	console.log(result);
    	response.header("X-Content-Type-Options", "nosniff");
    	return response.jsonp(JSON.stringify(result));
    } else {
    	console.log("intent: no document matches the provided query. trying again.");
    	get_db(uuid, response);
    }
    return result;
  }).catch(err => console.log("error: failed to find document"));
}

app.get('api/friends', function(request, response)
{
	var uuid = String(request.query.uuid);
	if (typeof uuid === "undefined")
	{
		console.log("error");
		response.header("X-Content-Type-Options", "nosniff");
		return response.jsonp({"error": "error"});
	}
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
