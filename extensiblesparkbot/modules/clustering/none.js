/**
*
*	Default. Used when there is no load balancing taking place within the worker nodes. Could be a case of single worker running or external load balancer/service 
*	
*	@author Conor Murphy
*
*	@module none
*/

var utils = require('../../utils/common');
var traversal = require('../../utils/traversal');

// Import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];

// Using express module to listen for webhook posts
var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

module.exports =
{

	/**
    *
    *   
    *   Initialise the server to listen for webhook posts from spark
    * 
    *   @function initialise
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
	initialise:function(spark,commandReference)
	{

		var server = app.listen( config.worker.clustering.none.listeningPort, function () {
		   var host = server.address().address
		   var port = server.address().port

		   console.log("Listening at http://%s:%s", host, port)
		})


		module.exports.retrieveNewMessage(spark,commandReference);

	},

	/**
    *
    *   
    *   When a message creation notification has been received on the webhookURL then retrieve the message from Spark, break it into arguments and then analyse/respond
    * 
    *   @function retrieveNewMessage
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
    retrieveNewMessage: function retrieveNewMessage(spark,commandReference)
	{


		app.get('/', function (req, res) {

		});

		app.post('/bot', function(req, res) {

			if (req.body.resource == "memberships" && req.body.event == "created" && req.body.data.personEmail != config.worker.botEmail)
  			{
  				
  				/**
  				*
  				*	Using this to see who is entering a spark room. If the room is restricted  to only internal users then remove the external user and send a message
  				*/

  				var internalDomain = config.worker.accessBehaviour.internalDomain; 
  				

  				if ((req.body.data.personEmail.substr(req.body.data.personEmail.length - internalDomain.length) != internalDomain) && (config.worker.accessBehaviour.removeExternal == "true"))
  				{

  					
  						spark.membershipByRoomByEmail(req.body.data.roomId, req.body.data.personEmail)
							  .then(function(membership) {
							    spark.membershipRemove(membership.id)
									.then(function() {
										spark.messageSendRoom(req.body.data.roomId, {
											markdown: "This room is for internal users only"	
										})
										  .then(function() {
											
										  })
										  .catch(function(err){
											console.log(err);
										  });
								})
								.catch(function(err){
									console.log(err);
								});
							  })
							  .catch(function(err){
							    console.log(err);
							  });

  				}

  			}
			else if (req.body.data.personEmail != config.worker.botEmail)
  			{

  				spark.messageGet(req.body.data.id)
				  .then(function(message) {
				  	traversal['analyseMessage'](spark, commandReference, utils['parse'](message.text, true), message);
				  })
				  .catch(function(err) {
					// process error
					console.log(err);
				  });
	  		}
				
				

		});


	}



}

	







