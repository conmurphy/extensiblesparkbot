/**
*
*   This is for custom clustering or load balancing modules. If the 'none' function is used then it is assumed that a single worker exists or an external lb is available.
*   
*   @module clusteringModules
*
*/

var none = require('./modules/clustering/none');
var pubnub = require('./modules/clustering/pubnub');
var polling = require('./modules/clustering/polling');

module.exports =
{
    /**
    *
    *   
    *   Default. Used when there is no load balancing taking place within the worker nodes. Could be a case of single worker running or external load balancer/service
    * 
    *   @function none
    *
    *   @author Conor Murphy
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
	 none: function(spark,commandReference) {
        
        none['initialise'](spark,commandReference);
     
    },
    /**
    *
    *
    *   PubNub load balancing module
    * 
    *   @function pubnub
    * 
    *   @author Conor Murphy
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
    pubnub: function(spark,commandReference) {
     	
     	pubnub['initialise'](spark,commandReference);
     
    },
    /**
    *
    *
    *   Polling module
    * 
    *   @function polling
    * 
    *   @author Conor Murphy
    *
    *   @param {class} spark Spark instance that is attached to a Spark account
    *   @param {object} commandReference Object composed of valid bot commands    
    *
    */
    polling: function(spark,commandReference) {
        
        polling['initialise'](spark,commandReference);
     
    }
    
    
}