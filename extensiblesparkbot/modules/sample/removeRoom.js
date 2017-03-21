/**
*
*	This function removes the bot from a specified room 
*	
*	@author Conor Murphy
*
*	@module removeRoom
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
    *   Remove bot from a specified room
    * 
    *   @function removeRoom
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark  
    *
    */
    removeRoom: function(messageArgs, spark, message) {

		/**
		*
		*	If there is one argument, the room name, then get the room id by using the room
		*	name. Then find the membership id by the room id and spark bot email.
		* 	Finally delete the bot from the room and send an response message
		*
		*/
		
		if(messageArgs.length==1)
     	{
     	
     		firstArgument =  messageArgs[0].pop();
			roomName = firstArgument.value;			
			roomID = '';
			roomFound = false;
			
     		spark.roomsGet()
			.then(function(rooms) {
							
				// process rooms as array
				rooms.forEach(function(room) {
					  
					if(roomName == room.title)
					{
						roomID = room.id;	
						roomFound = true;			
			
					}
				});
				
				if (roomFound)
				{
					spark.membershipByRoomByEmail(roomID, config.worker.botEmail)
					.then(function(membership) {
						spark.membershipRemove(membership.id)
						.then(function() {
							spark.messageSendRoom(message.roomId, {
								text: "Removing bot from room: " +  roomName
							})
							.then(function(message) {
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
  				else
  				{
  					spark.messageSendRoom(message.roomId, {
						text: "Error: Room not found"
					})
					.then(function(message) {
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