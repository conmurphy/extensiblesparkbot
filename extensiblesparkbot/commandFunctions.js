/**
*
*	This is for custom functions that are used in commands. For example, when you want to send an attachment we reference the sendAttachment function in the command-admin reference.
*	
*   @module commandFunctions
*
*/

var checkWeather = require('./modules/sample/checkWeather');
var listFeaturesRequested = require('./modules/sample/listFeaturesRequested');
var listFeedback = require('./modules/sample/listFeedback');
var listRooms = require('./modules/sample/listRooms');
var removeRoom = require('./modules/sample/removeRoom');
var reportStats = require('./modules/sample/reportStats');
var sendFeature = require('./modules/sample/sendFeature');
var sendFeedback = require('./modules/sample/sendFeedback');
var sendMessage = require('./modules/sample/sendMessage');

var addUser = require('./modules/sample/cisco/virl/addUser');
var listSims = require('./modules/sample/cisco/virl/listSims');

var listServiceRequests = require('./modules/sample/cisco/ucsd/listServiceRequests');
var retrieveCatalog = require('./modules/sample/cisco/ucsd/retrieveCatalog');
var submitRequest = require('./modules/sample/cisco/ucsd/submitRequest');

var runCommand = require('./modules/sample/cisco/nxapi/runCommand');


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
        
        checkWeather['checkWeather'](messageArgs, spark, message);
     
    },
    /**
    *
    *   
    *   List the feature requests
    * 
    *   @function listFeaturesRequested
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
	 listFeaturesRequested: function(messageArgs, spark, message) {
     	
     	listFeaturesRequested['listFeaturesRequested'](messageArgs, spark, message);
     
    },
    /**
    *
    *   
    *   List the feedback for the bot
    * 
    *   @function listFeedback
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    listFeedback: function(messageArgs, spark, message) {
     	
     	listFeedback['listFeedback'](messageArgs, spark, message);
     
    },
    /**
    *
    *   
    *   List the rooms which the bot has access to
    * 
    *   @function listRooms
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    listRooms: function(messageArgs, spark, message) {
     	
     	listRooms['listRooms'](messageArgs, spark, message);
     
    },
    /**
    *
    *   
    *   Remove bot from room
    * 
    *   @function removeRoom
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    removeRoom: function(messageArgs, spark, message) {
     	
     	removeRoom['removeRoom'](messageArgs, spark, message);
     
    },
    /**
    *
    *   
    *   Compile a summarised usage report for spark rooms  
    * 
    *   @function reportStatsBrief
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    reportStatsBrief: function(messageArgs, spark, message ){
     	
     	reportStats['reportStatsBrief'](messageArgs, spark, message);
    
    },
     /**
    *
    *   
    *   Compile a summarised usage report for spark rooms  
    * 
    *   @function reportStatsBrief
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    reportStatsDetailed: function(messageArgs, spark, message ){
        
        reportStats['reportStatsDetailed'](messageArgs, spark, message);
    
    },
    /**
    *
    *   
    *   Send a message to all rooms or a selection of rooms
    * 
    *   @function sendFeature
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    sendFeature: function(messageArgs, spark, message ){
     	
     	sendFeature['sendFeature'](messageArgs, spark, message);
    
    },
    /**
    *
    *   
    *   Send a message to all rooms or a selection of rooms
    * 
    *   @function sendFeedback
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    sendFeedback: function(messageArgs, spark, message ){
     	
     	sendFeedback['sendFeedback'](messageArgs, spark, message);
    
    },
    /**
    *
    *   
    *   Send a message to all rooms or a selection of rooms
    * 
    *   @function sendMessage
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    sendMessage: function(messageArgs, spark, message ){
     
     	sendMessage['sendMessage'](messageArgs, spark, message);
    
    },

     /**
    *
    *   
    *   Add a user to VIRL
    * 
    *   @function addUser
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     addUser: function(messageArgs, spark, message) {
        
        addUser['addUser'](messageArgs, spark, message);
     
    },

     /**
    *
    *   
    *   Add a user to VIRL
    * 
    *   @function addUser
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     listSims: function(messageArgs, spark, message) {
        
        listSims['listSims'](messageArgs, spark, message);
     
    },

     /**
    *
    *   
    *   Retrieve a catalog from UCSD
    * 
    *   @function retrieveCatalog
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     retrieveCatalog: function(messageArgs, spark, message) {
        
        retrieveCatalog['retrieveCatalog'](messageArgs, spark, message);
     
    },

     /**
    *
    *   
    *   List UCSD service requests
    * 
    *   @function listServiceRequests
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     listServiceRequests: function(messageArgs, spark, message) {
        
        listServiceRequests['listServiceRequests'](messageArgs, spark, message);
     
    },

     /**
    *
    *   
    *   Submit a new service request
    * 
    *   @function submitRequest
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     submitRequest: function(messageArgs, spark, message) {
        
        submitRequest['submitRequest'](messageArgs, spark, message);
     
    },

    /**
    *
    *   
    *   Sample function to run a command against the NX-API 
    * 
    *   @function runCommand
    *
    *   @author Conor Murphy
    *
    *   @param {object} messageArgs User arguments parsed from the command
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
     runCommand: function(messageArgs, spark, message) {
        
        runCommand['runCommand'](messageArgs, spark, message);
     
    },
}