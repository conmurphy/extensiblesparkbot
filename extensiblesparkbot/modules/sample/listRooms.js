/**
*
*	This function lists the rooms the bot has access to.
*	
*	@author Conor Murphy
*
*	@module listRooms
*/

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];
var utils = require('../../utils/common');

module.exports =
{
	/**
    *
    *   
    *  	List the rooms the bot has access to
    * 
    *   @function listRooms
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark  
    *
    */
    listRooms: function(messageArgs, spark, message) {

		spark.roomsGet()
		.then(function(rooms) {		
			
			var textToSend = 'Spark Rooms Containing Bot: \n\n';
							
			// process rooms as array
			rooms.forEach(function(room) {
	

				if(!utils['checkExists'](room.title, config.worker.restrictedRooms))
				{	
					textToSend += room.title + '\n';
				}
				else
				{
					textToSend += room.title + ' (RESTRICTED ROOM FOR POSTING)\n';
				}				
								
			});
			
			spark.messageSendRoom(message.roomId, {
				text: textToSend
			})
			.then(function() {
				
			})
			.catch(function(err){
				console.log(err);
			});
		})
		.catch(function(err) {
			// process error
			console.log(err);
		});
	
    
    },
}