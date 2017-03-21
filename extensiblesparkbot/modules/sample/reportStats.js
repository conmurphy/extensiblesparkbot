/**
*
*	This function creates a report of spark room statistics such as the number of messages per time period, the top users, message count per user
*	
*	@author Conor Murphy
*
*	@module reportStats
*/

var utils = require('../../utils/common');
var values = require('object.values');

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];

var _ = require('underscore'); 

module.exports =
{
	/**
    *
    *   
    *   Report summarised user message count for a rooms
    * 
    *   @function reportStatsBrief
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark  
    *
    */
    reportStatsBrief: function(messageArgs,spark, message) {

		var roomID = "";
		var userMessages = [];
		var userStats = {};
		

     	// If there are two arguments (room name) then process
     	if(messageArgs.length==2)
     	{
			firstArgument =  messageArgs[0].pop();
			secondArgument =  messageArgs[1].pop();
			
			roomName = firstArgument.value;
			personEmail = firstArgument.personEmail;
			timePeriod = secondArgument.value;
			
			spark.roomsGet()
			.then(function(rooms) {
						
				/**
				*
				*	find the room id based on the title provided by the user in the command
				*/
				rooms.forEach(function(room) {
					if(roomName == room.title)
					{
						roomID = room.id;
					}
				});
				
				/**
				*
				*	if its a known room then process the command, otherwise return back 
				*	a message to state that it's an unknown room
				*/
				if(roomID)
				{
				
					spark.messagesGet(roomID)
					.then(function(messages) {
					
						/**
						*
						*	convert the message time created into the fiscal year
						*/
				
						for(var i=0; i<messages.length; i++) {
						 	var personEmail = messages[i].personEmail;
						 	var created = messages[i].created;
						 	var d = new Date(created);
						 	var currentMonth = d.getMonth();
						 	var currentYear = d.getFullYear();
						 	
						 	var fiscal = utils['findFiscal'](currentMonth,currentYear);				 	
						 	
						 	
						 	if(!userMessages && personEmail != config.worker.botEmail && fiscal) 
						  	{
						  		userMessages = []; // start the array
						  	}
						  
						  	if(personEmail != config.worker.botEmail && fiscal)
							{
						  		userMessages.push({'fiscalYear':fiscal,'personEmail':personEmail});
							}
						
						}
						
						/**
						*
						* This will return the number of messages grouped by fiscal year 
						* and person
						*
						*/
						var counted = userMessages.reduce(function(sum, item) 
						{
						  var fiscalYear = item.fiscalYear;
						  var personEmail = item.personEmail;

						  if (sum[fiscalYear]) {
							if (sum[fiscalYear][personEmail]) {
							  sum[fiscalYear][personEmail] = sum[fiscalYear][personEmail] + 1;
							} else {
							  sum[fiscalYear][personEmail] = 1;
							}
						  } else {
							sum[fiscalYear] = {};
							sum[fiscalYear][personEmail] = 1;
						  }
						  return sum;
						}, {})
						
						var report = '\n\n Spark Room Usage - ' + roomName + '\n\n';
						
						
						for (prop in counted)
						{
							report += '=== User Message Count - ' + prop +' === \n\n'
								
									for (i = 0; i < values(counted[prop]).length; i++)
									{
									
										report += Object.keys(counted[prop])[i] + ': ' + values(counted[prop])[i] + '  \n\n';							 
																			
									}
						}						
						
						spark.messageSendRoom(message.roomId, {
							text: report
						})
						.then(function(message) {
						})
						.catch(function(err){
							console.log(err);
						});
	
					})
					.catch(function(err) {
						// process error
						console.log(err);
					});

					
				
				}
				else
				{
					spark.messageSendRoom(message.roomId, {
						text: "Error: Unknown Room: " +  roomName
					})
					.then(function() {
				
					})
					.catch(function(err){
						console.log(err);
					});
				}
			})
			.catch(function(err) {
				// process error
				console.log(err);
			});
						  
			
				
			
		}
    
    },
    /**
    *
    *   
    *   Report  user messages  for a room
    * 
    *   @function reportStatsDetailed
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark  
    *
    */
    reportStatsDetailed: function(messageArgs,spark, message) {

		var roomID = "";
		var userMessages = [];
		var userStats = {};
	

     	// If there are two arguments (room name) then process
     	if(messageArgs.length==1)
     	{
			firstArgument =  messageArgs[0].pop();
			
			roomName = firstArgument.value;
			personEmail = firstArgument.personEmail;
			
			spark.roomsGet()
			.then(function(rooms) {
						
				/**
				*
				*	find the room id based on the title provided by the user in the command
				*/
				rooms.forEach(function(room) {
					if(roomName == room.title)
					{
						roomID = room.id;
					}
				});
				
				/**
				*
				*	if its a known room then process the command, otherwise return back 
				*	a message to state that it's an unknown room
				*/
				if(roomID)
				{
				
					spark.messagesGet(roomID)
					.then(function(messages) {
					
						/**
						*
						*	convert the message time created into the fiscal year
						*/
				
						for(var i=0; i<messages.length; i++) {
						 	var personEmail = messages[i].personEmail;
						 	var text = messages[i].text;
						 	var created = messages[i].created;
						 	var d = new Date(created);
						 	var currentMonth = d.getMonth();
						 	var currentYear = d.getFullYear();
						 	
						 	var fiscal = utils['findFiscal'](currentMonth,currentYear);				 	
						 	
						 	if(!userMessages && personEmail != config.worker.botEmail && fiscal) 
						  	{
						  		userMessages = []; // start the array
						  	}
						  
						  	if(personEmail != config.worker.botEmail && fiscal)
							{
						  		userMessages.push({'fiscalYear':fiscal,'personEmail':personEmail, 'message':text});
							}
						
						}
												
						var report = '\n\n Spark Room Usage - ' + roomName + '\n\n';
					
						var sortedObjs =  _.chain(userMessages).sortBy('personEmail').sortBy('fiscalYear').reverse().value();

						currentYear = ""
						currentPerson = ""

						sortedObjs.forEach(function(value){
							
							if (value.fiscalYear != currentYear)
							{
								report += '=== User Messages - ' + value.fiscalYear +' === \n\n'
								currentYear = value.fiscalYear
							}
							
							if (value.personEmail != currentPerson)
							{
								report += '\n';
								report += value.personEmail + '\n';
								report += '-----------------\n';		
								report += value.message + '\n';	
								currentPerson = value.personEmail
							}
							else
							{
								report += value.message + '\n';	
							}
							
						});
						
						
						spark.messageSendRoom(message.roomId, {
							text: report
						})
						.then(function(message) {
						})
						.catch(function(err){
							console.log(err);
						});
	
					})
					.catch(function(err) {
						// process error
						console.log(err);
					});

					
				
				}
				else
				{
					spark.messageSendRoom(message.roomId, {
						text: "Error: Unknown Room: " +  roomName
					})
					.then(function() {
				
					})
					.catch(function(err){
						console.log(err);
					});
				}
			})
			.catch(function(err) {
				// process error
				console.log(err);
			});
						  
			
				
			
		}
    
    },

    

}
		