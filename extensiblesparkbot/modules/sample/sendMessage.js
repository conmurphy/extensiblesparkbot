/**
*
*	This function sends a message in text to the room specified. Only an admin can send a message. Admins are specified in the config file. Rooms can also be put on a deny list to ensure they do not receive a message. e.g. it may not be beneficial	to send a message to a room with hundreds of people.
*	
*	@author Conor Murphy
*
*	@module sendMessage
*/

var utils = require('../../utils/common');

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];	

module.exports =
{
	/**
    *
    *   
    *   Send message to room or rooms
    * 
    *   @function sendMessage
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark  
    *
    */
    sendMessage: function(messageArgs, spark, message) {
		
			
     	// If there are two arguments (room name and text to send) then process
     
     	if(messageArgs.length==2)
     	{
			firstArgument =  messageArgs[0].pop();
			
			messageID = firstArgument.messageID;
			roomName = firstArgument.value;
			personEmail = firstArgument.personEmail;
			textToSend = messageArgs[1].pop().value;
			filesToSend = message.files;
			
			
			/*
			
				If the admin has specified to send the message to all the spark rooms that
				the bot is a part of then retrieve the list. Before sending out the messages
				first check to ensure that the room is not on the restricted rooms list
				and also that the person sending the bulk message is an admin.
				
			*/
					
				if(roomName == 'all' ) 
				{
					spark.roomsGet()
					  .then(function(rooms) {
						// process rooms as array
						rooms.forEach(function(room) {
					  
						  if(!utils['checkExists'](room.title, config.worker.restrictedRooms))
						  {
							spark.messageSendRoom(room.id, {
								text: textToSend,
								//files: filesToSend
							  })
							  .then(function() {
								spark.messageSendRoom(message.roomId, {text: "Message sent to room: " + room.title});
							  })
							  .catch(function(err){
								console.log(err);
							  });
						
						  }	
						  else if (utils['checkExists'](room.title, config.worker.restrictedRooms))
						  {
								spark.messageSendRoom(message.roomId, {
									text: "Sending messages to room, " + room.title + ", is restricted"
								  })
								  .then(function(message) {
								  })
								  .catch(function(err){
									console.log(err);
								  });
						  }
					
						});
					  })
					  .catch(function(err) {
						// process error
						console.log(err);
					  });
			
				}
				else
				{
					if(!utils['checkExists'](roomName, config.worker.restrictedRooms))
					{
						/*
						
							This is used to send a message to either a single room
							or in te future a selection of rooms.
						
						*/
						
						spark.roomsGet()
						.then(function(rooms) {
							
							var roomFound = false;
							
							// process rooms as array
							rooms.forEach(function(room) {
					  
					  			if(roomName == room.title)
					  			{
									roomFound = true;
									
									spark.messageSendRoom(room.id, {
										text: textToSend,
										//files: filesToSend
									  })
									  .then(function() {
										spark.messageSendRoom(message.roomId, {text: "Message sent to room: " + room.title});
									  })
									  .catch(function(err){
										console.log(err);
									  });
								}
							});
							
							if (!roomFound)
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
					else if (utils['checkExists'](room.title, config.worker.restrictedRooms))
					{
						spark.messageSendRoom(message.roomId, {
							text: "Sending messages to room, " + room.title + ", is restricted"
						})
						.then(function(message) {
						})
						.catch(function(err){
							console.log(err);
						});
					}
				}
			
			
		}
    
    },
}