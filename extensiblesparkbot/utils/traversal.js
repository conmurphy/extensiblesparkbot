/**
*
*   This is for shared traversal functions
*   
*   @author Conor Murphy
*
*   @module traversal
*/


//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')['config'][env]; 

var commandFunctions = require('../commandFunctions');
var utils = require('./common');

var messageArgs = [];

module.exports =
{

    /**
    *
    *   
    *   Determine if the first argument matches one of the bots initial commands
    * 
    *   @function analyseMessage
    *
    *   @author Conor Murphy
    *
    *   @param {class} spark Spark instance that is attached to a Spark account  
    *   @param {object} commandReference Object composed of valid bot commands    
    *   @param {object} args Object composed of parsed arguments   
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    analyseMessage:function(spark,commandReference, args,message)
    {


        

        /**
        *
        *   This will loop through the list of first arguments to see if the bot should respond
        *   If nothing is found then it won't respond.
        *   If the first argument of the command is one we recognize then check if it requires an 
        *   admin 
        *   If the use is not part of the internalDomain then check if the command references allows for external use
        *   If it does then check if the user running the command is an admin
        *   If they are then start he traversal, if they aren't then send a response
        *   If it's not an admin command then start the traversal
        *
        *   Want to build this out in the future to support a proper RBAC structure with roles/orgs/privileges etc
        *   Also need to integrate into external systems
        * 
        */

        for (var prop in config.worker.firstArgument)
        {
            
            if (args[0] == prop)
            {
               
                if ((message.personEmail.substr(message.personEmail.length - config.worker.accessBehaviour.internalDomain.length) != config.worker.accessBehaviour.internalDomain) && (config.worker.firstArgument[prop].allowExternal == "false"))
                {
                    spark.messageSendRoom(message.roomId, {markdown: 'Command restricted to ' + config.worker.accessBehaviour.internalDomain + ' users'});
                }
                else
                {

                    if (config.worker.firstArgument[prop].requiresAdmin == 'true')
                    {   
                    
                        if(utils['checkExists'](message.personEmail, config.worker.admin))
                        {
                            /**
                            *   
                            *   Start the traversal with command tree starting from args[1]. args[0] is
                            *   the bot name, initial argument, or whatever is preferred such as '/bot'
                            *
                            */
                            module.exports.traverse(spark, args, commandReference[prop], 1, message);

                            return null;
                        }
                        else 
                        {
                            spark.messageSendRoom(message.roomId, {text: 'Must be an admin to use '+ prop +' commands'});
                        }
                    }
                    else
                    {
                        /**
                        *   
                        *   Start the traversal with command tree starting from args[1]. args[0] is
                        *   the bot name, initial argument, or whatever is preferred such as '/bot'
                        *
                        */
                        module.exports.traverse(spark, args, commandReference[prop], 1, message);

                        return null;
                    }
                    
                }
            }
        }
        return null;

    },
    /**
    *
    *   
    *   Traverse the command object to validate the users command
    * 
    *   @function traverse
    *
    *   @author Conor Murphy
    *
    *   @param {class} spark Spark instance that is attached to a Spark account    
    *   @param {object} args Object composed of parsed arguments   
    *   @param {object} obj Current command reference object. Contains only current command level and below
    *   @param {integer} argPos Current argument position
    *   @param {object} message Spark Mesage object received from Spark
    *
    */
    traverse:function(spark, args, obj,argPos,message) {
        
                        
        var commandValid = false;
                        
        /*
            For each command in the current level test whether or not the 
            next level is an object. if it is and there are no more arguments
            then you have too few args. 
                            
            else if it is an object and there are more arguments, call 
            traverse function  again to go to the next sub command and perform
            same checks until you reach the last subcommand

            if it's the last sub command then message the spark room with the
            name and detail/answer of the command
                             
            if it loops through all commands at current level and the command
            hasn't been found then the command is not recognized. 
                             
            for any commands that have too many, too few arguments, or are 
            not recognized, message the spark room with the .usage detail 
            from the command json reference for the current command
                            
        */

        for (var prop in obj) {
                        
            if(argPos > args.length-1 && typeof obj[prop] == 'object' && obj[prop])
            {
                var usageString = "<BR> Command not recognized <BR><BR>" + obj.usage;   
                        
                spark.messageSendRoom(message.roomId, {markdown: usageString});
                                
                return null;
            }
            else if(typeof obj[prop] == 'object' && obj[prop])
            {
                /*
                                    
                    '$$' will be parsed as user input so we lookup the 
                    argument name and store it and any other arguments in the 
                    command in an array with a reference to the messageID
                                    
                */
                                
                if(prop == "$$")
                {
                                    
                    messageArgs.push([{'messageID':message.id,'personEmail':message.personEmail, 'argumentName':obj.argumentName, 'value':args[argPos]}]);
                    commandValid = true;
                    module.exports.traverse(spark, args, obj[prop], argPos + 1, message);
                    return null;
                }
                else if(prop == "$regex$")
                {
                    var pattern = new RegExp(obj.pattern);
                    
                    if (pattern.test(args[argPos]))
                    {
                        messageArgs.push([{'messageID':message.id,'personEmail':message.personEmail, 'argumentName':obj.argumentName, 'value':args[argPos]}]);
                        commandValid = true;
                        module.exports.traverse(spark, args, obj[prop], argPos + 1, message);
                    }
                    else
                    {
                        var usageString = "<BR> Command not recognized <BR><BR>" +  obj.usage;
                        spark.messageSendRoom(message.roomId, {markdown: usageString});
                                        
                        return null;
                    }
                    
                    return null;
                }
                else if(prop == args[argPos])
                {
                    commandValid = true;
                    module.exports.traverse(spark,args,obj[prop], argPos + 1, message);
                    return null;
                                    
                }
            }
            else 
            {
                /*
                                
                    - If there are more arguments than needed then its an error
                    - If the command calls on a function then call the function
                    name referenced in the command-admin reference 
                    - If it's returning text then just send the name and detail
                                
                    - clean up args once these have been sent to the function
                */
                if(args.length > argPos)
                {
                    var usageString = "<BR> Command not recognized <BR><BR>" + obj.usage;   
                    spark.messageSendRoom(message.roomId, {markdown: usageString});
                                    
                    return null;
                }
                else if (obj.commandType == 'function')
                {
                    commandValid = true;
                    
                    commandFunctions[obj.function](messageArgs,spark, message);
                                    
                    messageArgs = [];
                                    
                    return null;
                }
                else if (obj.commandType == 'readonly')
                {
                                        
                                        
                    commandValid = true;
                    var usageString = '\n\n' + obj.detail;    
                    spark.messageSendRoom(message.roomId, {markdown: usageString});                 
                                
                    return null;
                }
            }
        }
                        
        //final check if the command/subcommand can be found. 
        
        if(!commandValid)
        {

            var usageString = "<BR> Command not recognized <BR><BR>" + obj.usage;    
            spark.messageSendRoom(message.roomId, {markdown: usageString});
                            
            return null;

        }
                         
                        
    }
   
    

    
    

}