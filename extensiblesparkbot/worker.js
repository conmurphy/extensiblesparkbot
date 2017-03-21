/**
*
*	Generic Spark Bot 
*
*   @author Conor Murphy
*
*/

var Spark = require('node-sparky');

var clusteringModules = require('./clusteringModules');
var seedrandom = require('seedrandom');

var values = require('object.values');
/**
*
* 	Import config details - gitignored
*
*/
var env = process.env.NODE_ENV || 'development';
var config = require('./config/config')['config'][env];	

var token = process.env.BOT_TOKEN || config.worker.token;

var spark;
var messageArgs = [];
var webhookFound = false;
var commandReference = {};


/**
*
* 	This is the main function to create the spark connections
*
*/

function initialise()
{

	/**
	*
	* 	Read the command references - In the config file there is a firstArgument component 
	*	which accepts the first argument as the key and the key is the command reference file 
	*	to use. I've split it out this way so that anyone can add in their own first arguments
	*	as well as have the ability to maintain separate command references.
	*
	*	This will read in the command references and store them based on the first argument (prop)
	*	test comment
	*/

	for (var prop in config.worker.firstArgument)
	{

		commandReference[prop] = require('./commands/'+config.worker.firstArgument[prop].commandReference);
	
	}

	/**
	*
	* 	Authenticate with token
	*
	*/

	// If we're using the polling module then we don't need a webhook 
	
	if (Object.keys(config.worker.clustering) == 'polling')
	{
		spark = new Spark({ 
		token: token
		});
	}
	else
	{
		spark = new Spark({ 
			token: token,
			webhookUrl:values(config.worker.clustering)[0].webhookURL
		});


		/**
		*
		* 	Check if there's already a webhook for our target URL
		*
		*/
		spark.webhooksGet()
		 .then(function(webhooks) {
			webhooks.forEach(function(webhook) {
				if(webhook.targetUrl == values(config.worker.clustering)[0].webhookURL)
				{
					webhookFound = true;
				}
			});
				
			//if we can't find a webhook then create one
			if(!webhookFound)
			{
				spark.webhookAdd('messages', 'created', 'bot')
				.then(function(webhook) {
					console.log('Creating webhook ...');
				})
				.catch(function(err) {
					// process error
					console.log(err);
				});
				spark.webhookAdd('memberships', 'created', 'bot')
				.then(function(webhook) {
					console.log('Creating webhook ...');
				})
				.catch(function(err) {
					// process error
					console.log(err);
				});
				spark.webhookAdd('memberships', 'updated', 'bot')
				.then(function(webhook) {
					console.log('Creating webhook ...');
				})
				.catch(function(err) {
					// process error
					console.log(err);
				});
			}
		})
		.catch(function(err) {
			// process error
			console.log(err);
		});
	}
	


	try {
	  var moduleToLoad = require('./modules/clustering/'+Object.keys(config.worker.clustering));		 
	} catch (err){
	   console.log(Object.keys(config.worker.clustering) + ' is not installed.');
	}
 

	/**
	*
	* 	Kick off the process to wait and respond to messages
	*
	*/ 

	console.log('Listening...');
	
  	clusteringModules[Object.keys(config.worker.clustering)](spark,commandReference);


	/**
	*
	*	This function is called when you want the server to die gracefully
	* 	i.e. wait for existing connections
	*
	*/
	var gracefulShutdown = function() {
	  console.log('Received kill signal, shutting down gracefully.');
	  process.exit();

  
	}

	// listen for TERM signal .e.g. kill 
	process.on ('SIGTERM', gracefulShutdown);

	// listen for INT signal e.g. Ctrl-C
	process.on ('SIGINT', gracefulShutdown);  

	
 

}

/**
*
* 	Call the main function to initialise the spark and pubnub connections
*
*/

initialise();




