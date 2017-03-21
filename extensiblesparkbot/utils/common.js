/**
*
*   This is for shared util functions
*   
*   @author Conor Murphy
*
*   @module common
*/

//import config details - gitignored
var env = process.env.NODE_ENV || 'development';
var config = require('../config/config')['config'][env]; 

var messageArgs = [];

module.exports =
{


    /**
    *
    *   
    *   Capitalise the first letter of the string
    * 
    *   @function capitalise
    *
    *   @param {string} string String to capitalise
    *
    */
    capitalise: function(string) {
     	return string.charAt(0).toUpperCase() + string.slice(1);
    },
    /**
    *
    *   
    *  Check if the a value exists in an object
    * 
    *   @function checkExists
    *
    *   @param {string} string Value to check
    *   @param {object} obj Object to check
    *
    */
    checkExists: function(toCheck, obj) {
     	 
     	 for (var prop in obj)
		 {
		 
			if (obj[prop] == toCheck)
			{
				return true;
			}
		 }
		
		return false;

    },
    /**
    *
    *   
    *   Work out fiscal quarter
    * 
    *   @function findFiscal
    *
    *   @param {integer} month Month integer value
    *   @param {integer} year Year integer value
    *
    */
    findFiscal: function(month, year) {
     	 
     	 /*
     	  	Q1 {8, 9, 10}
     	  	Q2 {11, 12, 1}
     	  	Q3 {2, 3, 4}
     	  	Q4 {5, 6, 7}
     	 
     	 	If it's Q1 or Q2 then year + 1 and take last two digits of year
     	 
     	 */
     	
     	 var quarter = '';
     	 var fy = '';
     	 if(month >= 8 && month <= 10)
     	 {
     	 	quarter = 1;
     	 	year += 1;
     	 	fy = year.toString().substr(2,2);
     	 	return 'Q' + quarter + 'FY' + fy;
     	 }
     	 else if (month == 11 || month == 12)
     	 {
     	 	quarter = 2;
     	 	year += 1;
     	 	fy = year.toString().substr(2,2);
     	 	return 'Q' + quarter + 'FY' + fy;
     	 }
         else if ( month == 1)
         {
            quarter = 2;
            fy = year.toString().substr(2,2);
            return 'Q' + quarter + 'FY' + fy;
         }
     	 else if(month >= 2 && month <= 4)
     	 {
     		quarter = 3;
     	 	fy = year.toString().substr(2,2);
     	 	return 'Q' + quarter + 'FY' + fy;
     	 }
     	 else if(month >= 5 && month <= 7)
     	 {
     	 	quarter = 4;
     	 	fy = year.toString().substr(2,2);
     	 	return 'Q' + quarter + 'FY' + fy;
     	 }
     	 else
     	 {
     	 	return false;
     	 }

    },
    /**
    *
    *   
    *   Parse string into arguments
    * 
    *   @function parse
    *
    *   @param {string} str String to parse
    *   @param {boolean} lookForQuotes If true then also parse by quotes. If false parse only parse by whitespace
    *
    */
    parse: function(str, lookForQuotes) {
     	var args = [];
			var readingPart = false;
			var part = '';
			for(var i=0; i < str.length; i++)
			{
				if(str.charAt(i) === ' ' && !readingPart)
				{
					args.push(part);
					part = '';
				}
				else
				{
					if(str.charAt(i) === '\"' && lookForQuotes)
					{
						readingPart = !readingPart;
					} else
					{
						part += str.charAt(i);
					}
				}
			}
			if (part != '' )
			{
				args.push(part);
			}
		 return args;
    },

    /**
    *
    *   
    *   Add padding to the right of a string
    * 
    *   @function pad
    *
    *   @str {string} str String to pad
    *   @padString {string} String to use for padding
    *   @length {int} number of characters to pad
    *
    */
    padRight: function (str, padString, length) {
        var str = this;
        while (str.length < length)
            str = str + padString;
        return str;
    }
   
   
    

    
    

}