/**
*
*	Provides basic clustering/load balancing function for spark bot utilising pubnub.com service 
*	
*	@author Conor Murphy
*
*	@module pubnub
*/

var utils = require('../../utils/common');
var traversal = require('../../utils/traversal');
var PubNub = require('pubnub');   

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../../config/config')['config'][env];
var pubnub;
var currentLowestRandom = [];
var currentLowestUUID = [];
var battleWins = 0 ;
var resetWins = false ;
var maxWins = 100;
var pubnubHistory = {};





module.exports =
{

	/**
    *
    *   
    *   Initialise pubnub
    * 
    *   @function initialise
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
	initialise:function(spark,commandReference)
	{

		/**
		* 
		* 	Initialize PubNub
		*
		*/
		pubnub = new PubNub({
			subscribeKey: config.worker.clustering.pubnub.subKey,
			publishKey: config.worker.clustering.pubnub.pubKey,
		})

		/**
		*
		* 	Subscribe to pubnub to retrieve messages
		*
		*/
		pubnub.subscribe({
			channels: [config.worker.clustering.pubnub.pubnubChannel,config.worker.clustering.pubnub.pubnubAdminChannel] 
		});



		/**
		*
		* 	Seed random number using the UUID of the bot
		*
		*/
		Math.seedrandom(pubnub.getUUID(), { entropy: true });
			
		/**
		*
		*	On initialisation each worker sends a notification to the admin channel to let the other workers
		*	know of its presence and to reset everyones battleWins back to 0.
		*
		*/


		var dataToPublish = {
			text: {'function':'imNew','uuid':pubnub.getUUID(),'reset':true}	
		};
						
		pubnub.publish({
			message: dataToPublish,
			channel: config.worker.clustering.pubnub.pubnubAdminChannel
		}, function(status, response) {
			if (status.error) {
				console.log("publishing failed w/ status: ", status);
			}
		});

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

	pubnub.addListener({
	
        message: function(message) {
  			
  			
  			if (message.channel == config.worker.clustering.pubnub.pubnubAdminChannel)
  			{

  				/*
  					
  					This is the component which will listen for any messages on the admin 
  					channel.
  					
  					As random numbers come in for messages it will keep track of the 
  					lowest number. We are keeping track of the lowest random number per
  					message as the worker may be working on multiple messages it receives
  					 
  					If it receives a message with the test 'imNew' then this is a new worker announcing itself.
  					In this case we reset everyones battleWins counter back to 0, otherwise the new workers
  					may always win the numberBattle until they catchup to the existing workers.

  					
  				*/
  				if (message.message.text.function == 'numberBattle')
  				{
  					

  					if (typeof currentLowestRandom[message.message.text.messageID] == 'undefined' || message.message.text.randomNumber < currentLowestRandom[message.message.text.messageID])
  					{
  						
  						currentLowestRandom[message.message.text.messageID] = message.message.text.randomNumber;
  						currentLowestUUID[message.message.text.messageID] = message.message.text.uuid;
  					}
  					
  					
  				
  				}
				else if (message.message.text.function == 'imNew')
  				{
  					
  					battleWins = 0;
  				
  				}
  				
  				/*
  				
  					When a worker reaches the maximum battle wins we reset all workers
  					battleWins back to 0. Added this check/reset as I'm not sure if there 
  					would be a performance impact or possibly number too large error? if 
  					the battleWins becomes to big. 
  					
  				*/
  				
  				if (message.message.text.reset == true)
  				{
  					battleWins = 0;
  					resetWins = false;
  				}
  				
				
			}
			else if (message.channel == config.worker.clustering.pubnub.pubnubChannel && message.message.resource == "memberships" && (message.message.event == "created" || message.message.event == "updated" ) && message.message.data.personEmail != config.worker.botEmail)
  			{
  				
  				/**
  				*
  				*	Using this to see who is entering a spark room. If the room is restricted  to only internal users then remove the external user and send a message
  				*/

  				var email = message.message.data.personEmail;
  				var internalDomain = config.worker.accessBehaviour.internalDomain; 
  				
  				if ((email.substr(email.length - internalDomain.length) != internalDomain) && (config.worker.accessBehaviour.removeExternal == "true"))
  				{

  					
  						spark.membershipByRoomByEmail(message.message.data.roomId, message.message.data.personEmail)
							  .then(function(membership) {
							    spark.membershipRemove(membership.id)
									.then(function() {
										spark.messageSendRoom(message.message.data.roomId, {
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
			else if (message.channel == config.worker.clustering.pubnub.pubnubChannel && message.message.data.personEmail != config.worker.botEmail)
  			{
				
				/*
					As subscribers of pubnub all receive the same message, this creates
					a problem when deploying multiple workers for scalability.
					
					As a simple fix for now when a new message arrives each worker node 
					will generate a random number and the worker with the lowest number
					will answer the message. 
					
					There's a potential for late responses from workers. In order to 
					overcome this all workers send their random number at time 
					message creation + 1500ms. If they are after this time then they do 
					not participate in this round. This is to 1. ensure workers receive 
					all random numbers and 2. ensure late workers are not duplicating 
					messages as they think theyre the only ones competing
					
					NOTE: NTP must be configured correctly on host to sync times
					
					Process
					
					1. find the delta between message creation + 1500ms
						and current time. wait until the delta is up. if delta < 0 then
						don't participate in this round
					2. generate random number 
					3. publish to pubnub admin channel with message id
					4. compare random numbers from other workers with this workers number
					5. track the smallest number and uuid
					6. if uuid = this workers uuid then respond to the message
				
					
				*/
				
				randomNumber = Math.random() + battleWins;
				
				var timeA = (parseInt(message.timetoken)/1e4) + parseInt(config.worker.clustering.pubnub.delayTime);
				var timeB = (parseInt(message.timetoken)/1e4) + parseInt(config.worker.clustering.pubnub.delayTime) * 2;
			
				var deltaA = Math.floor(timeA - parseInt((new Date).getTime()))
				
				if(deltaA > 0)
				{
				
					/*
						
						This is the first timeout which will wait until the message 
						creation + 1500ms has expired and then send the random number. This
						means all workers should send their random numbers at the same time
					
					
					*/
					setTimeout(function () {
				
				
						if (battleWins >= maxWins)
						{
							resetWins = true;
						}
						
						var dataToPublish = {
							text: {'function':'numberBattle','messageID':message.message.data.id,'uuid':pubnub.getUUID(),'randomNumber':randomNumber,'reset':resetWins}
						};
				
						pubnub.publish({
							message: dataToPublish,
							channel: config.worker.clustering.pubnub.pubnubAdminChannel
						}, function(status, response) {
							if (status.error) {
								console.log("publishing failed w/ status: ", status);
							}
						
						});
				
					}, deltaA)
				
				
					/*
						
						This is the second timeout which is our close window for when we 
						stop comparing numbers and decide a winner. In theory all workers 
						participating should receive all numbers in this time frame. 
						
						Possible errors could result from:
							- too many workers and not enough time to process all 
							messages in timeframe
							- distance latency issues
							
						Not much testing performed on scale or distance limits
					
					
					*/
					
					var deltaB = Math.floor(timeB - parseInt((new Date).getTime()));
				
					if(deltaB > 0 ){	
						setTimeout(module.exports.assignMessage, deltaB ,message,spark,commandReference);	
					}
				}
				
				
				
			}
     
        }
       
    })      


	},

	assignMessage:function(message,spark,commandReference)
	{	
		if(currentLowestUUID[message.message.data.id] == pubnub.getUUID())
		{
			
			spark.messageGet(message.message.data.id)
			  .then(function(message) {
			  	traversal['analyseMessage'](spark, commandReference, utils['parse'](message.text, true), message);
			  })
			  .catch(function(err) {
				// process error
				console.log(err);
			  });
			
			/*
			
				battleWins
				
				Every time a worker wins the random number battle and responds to a message
				we add 1 to their battle wins. The battle wins is then added to the random
				number generated every time there's a new message. This should more evenly
				distribute the message responses across the workers. Here's an example:
				
				Battle Wins:
				
				WorkerA - 0
				WorkerB - 0
				WorkerC - 0
				WorkerD - 0
				
				1. New message received
				
				Random numbers + BattleWins: 
				WorkerA - 0.43 + 0 = 0.43
				WorkerB - 0.55 + 0 = 0.55
				WorkerC - 0.11 + 0 = 0.11
				WorkerD - 0.73 + 0 = 0.73
				
				2. WorkerC wins battle and responds to message 
				
			 	Battle Wins:
				
				WorkerA - 0
				WorkerB - 0
				WorkerC - 1
				WorkerD - 0
				
				3. New message received
				
				Random numbers + BattleWins: 
				WorkerA - 0.43 + 0 = 0.43
				WorkerB - 0.55 + 0 = 0.55
				WorkerC - 0.22 + 1 = 1.22
				WorkerD - 0.73 + 0 = 0.73
				
				4. WorkerA wins battle and responds to message 
				
			 	Battle Wins:
				
				WorkerA - 1
				WorkerB - 0
				WorkerC - 1
				WorkerD - 0
				
				5. New message received
				
				Random numbers + BattleWins: 
				WorkerA - 0.34 + 1 = 1.34
				WorkerB - 0.99 + 0 = 0.99
				WorkerC - 0.21 + 1 = 1.22
				WorkerD - 0.17 + 0 = 0.17
				
				6. WorkerD wins battle and responds to message 
				
			 	Battle Wins:
				
				WorkerA - 1
				WorkerB - 0
				WorkerC - 1
				WorkerD - 1
				
				7. New message received
				
				Random numbers + BattleWins: 
				WorkerA - 0.93 + 1 = 1.93
				WorkerB - 0.56 + 0 = 0.56
				WorkerC - 0.11 + 1 = 1.11
				WorkerD - 0.73 + 1 = 1.73
				
				8. WorkerB wins battle and responds to message 
				
			 	Battle Wins:
				
				WorkerA - 1
				WorkerB - 1
				WorkerC - 1
				WorkerD - 1
				
				9. New message received - Since everyone has won a battle they are all
				on the same level and it starts again
				
				Random numbers + BattleWins: 
				WorkerA - 0.93 + 1 = 1.93
				WorkerB - 0.56 + 1 = 1.56
				WorkerC - 0.11 + 1 = 1.11
				WorkerD - 0.73 + 1 = 1.73
				
			*/
			
			battleWins += 1;
		}
		
		
		currentLowestRandom = [];
		currentLowestUUID = [];
	}


}

	





