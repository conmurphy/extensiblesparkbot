/**
*
*	Check the weather based on user input
*	
*	@author Conor Murphy
*
*	@module checkWeather
*/

var utils = require('../../utils/common');

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];

var weather = require('weather-js');

module.exports =
{
	 /**
    *
    *   
    *   Check the weather based on user input
    * 
    *   @function checkWeather
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    checkWeather: function(messageArgs, spark, message) {

    	var textToSend = '';

		if(messageArgs.length==1)
     	{
			firstArgument =  messageArgs[0].pop();
			
			messageID = firstArgument.messageID;
			city = firstArgument.value;

			weather.find({search: city, degreeType: 'C'}, function(err, result) {
			  if(err) console.log(err);
			 
			 	textToSend += 'Weather Report: \n \n- City: ' + result[0].location.name + ' \n- Oberservation Time: ' + result[0].current.observationtime + ' \n- Current Temperature: ' + result[0].current.temperature + " \n- Feels like: " + result[0].current.feelslike + result[0].location.degreetype + " \n- Sky Conditions: " + result[0].current.skytext  + " \n- Humidity: " + result[0].current.humidity + " \n- Windspeed: " + result[0].current.winddisplay  ;

			  	spark.messageSendRoom(message.roomId, {
					markdown: textToSend
				})
				.then(function() {
					
				})
				.catch(function(err){
					console.log(err);
				});			  

			});


		}

	
    },
}