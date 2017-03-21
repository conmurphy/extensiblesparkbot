/**
*
*	Used to poll Spark rather than use webhooks
*	
*	@author Conor Murphy
*
*	@module polling
*/

var utils = require('../../utils/common');
var traversal = require('../../utils/traversal');

// Import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];

var _ = require('underscore');
var previousMessages = [];
var newMessages = [];

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
    *   Initialise the server to  poll at a set interval
    * 
    *   @function initialise
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
	initialise:function(spark,commandReference)
	{

		// Since we're not using webhooks we need to poll every interval to check if there are any new messages

		setInterval(function(){module.exports.retrieveNewMessage(spark,commandReference)}, config.worker.clustering.polling.interval);

	},

	/**
    *
    *   
    *   Retrieve the message from Spark, break it into arguments and then analyse/respond
    * 
    *   @function retrieveNewMessage
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
    retrieveNewMessage: function retrieveNewMessage(spark,commandReference)
	{


		// Get the messages from Spark
		spark.messagesGet(config.worker.clustering.polling.roomID,config.worker.clustering.polling.maxMessages)
			.then(function(messages) {
				
				newMessages = messages;

				// This is used to to check if the previous messages are empty i.e. it's the first run.
				// Without this the difference check below will return all the existing messages which we may have already responded to
				// To overcome this we simply populate the previousMessages with the existing messages in Spark on the first run

				if (!previousMessages.length)
				{
					previousMessages = newMessages;
				}

			})
			.catch(function(err) {
				// process error
				console.log(err);
			});
		
		// This used the underscore library to compare the two arrays and find the difference between them i.e. the new messages from the 
		// last time that we polled

		var diff = _.filter(newMessages, function(obj){ return !_.findWhere(previousMessages, obj); });
		
		// Parse, validated and run each new message/command as per usual

		diff.forEach(function(message) {
	      	
	      	/**
			*
			*	Using this to see who is entering a spark room. If the room is restricted  to only internal users then remove the external user and send a message
			*/

			var internalDomain = config.worker.accessBehaviour.internalDomain; 
  				

			if ((message.personEmail.substr(message.personEmail.length - internalDomain.length) != internalDomain) && (config.worker.accessBehaviour.removeExternal == "true"))
  				{
					spark.membershipByRoomByEmail(message.roomId, message.personEmail)
						.then(function(membership) {
							spark.membershipRemove(membership.id)
								.then(function() {
									spark.messageSendRoom(message.roomId, {
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
  			else if (message.personEmail != config.worker.botEmail)
  			{
				traversal['analyseMessage'](spark, commandReference, utils['parse'](message.text, true), message);
	  		}

	    });

		// Update and reset the arrays

		previousMessages = newMessages;

		newMessages = [];	  
		 

	}



}

	







