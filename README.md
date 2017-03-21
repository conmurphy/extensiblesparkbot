# Extensible Spark Bot

Utilises the Node Sparky SDK to provide an extensible stateless Spark bot in which you can provide your own external command files and functions. Moving the command trees outside the core bot code allows you to update or even entirely re-purpose the bot in a very short time.

![alt tag](https://github.com/conmurphy/extensiblesparkbot/blob/master/images/highlevel.png?raw=true)

Table of Contents
=================

   * [Extensible Spark Bot](#extensible-spark-bot)
   * [Table of Contents](#table-of-contents)
      * [Installation](#installation)
         * [Deployment Options](#deployment-options)
         * [Standard](#standard)
         * [Vagrant - VirtualBox](#vagrant---virtualbox)
         * [Vagrant - AWS](#vagrant---aws)
         * [Docker](#docker)
         * [Docker Compose](#docker-compose)
         * [Rancher Compose](#rancher-compose)
      * [Files](#files)
         * [Descriptions](#descriptions)
         * [Config](#config)
            * [Main Config File](#main-config-file)
            * [Sample Config File](#sample-config-file)
         * [Command References](#command-references)
            * [Manual Command Reference](#manual-command-reference)
            * [Performing an Action](#performing-an-action)
            * [Accepting User Input](#accepting-user-input)
            * [Usage and Available Subcommands](#usage-and-available-subcommands)
            * [Sample Command Reference](#sample-command-reference)
      * [Load Balancing/Clustering](#load-balancingclustering)
         * [None](#none)
            * [Main Config File - Clustering - None](#main-config-file---clustering---none)
            * [Sample Config File - No Clustering/Load Balancing](#sample-config-file---no-clusteringload-balancing)
         * [PubNub](#pubnub)
            * [Sample Config File - Using PubNub Module](#sample-config-file---using-pubnub-module)
   * [Custom Modules](#custom-modules)
      * [Writing Custom Module - No User Input](#writing-custom-module---no-user-input)
      * [Writing Custom Module - User Input](#writing-custom-module---user-input)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

## Installation

### Deployment Options

* **Standard** - installing and running in a preconfigured environment
* **Vagrant VirtualBox** -  build a new guest environment within VirtualBox
* **Vagrant AWS** - build a new guest environment within AWS
* **Docker** - building image from Dockerfile and running worker bot container
* **Docker** Compose - using Docker Compose to bring up environment
* **Rancher** - using Rancher to deploy stack 

### Standard

Use these commands if you already have an environment set up and just wish to install and run the worker. For example you have a CentOS/Ubuntu VM or bare metal server.

#### Prerequisites
* Node
* NPM

1. Clone git repository
   
        git clone git@github.com:conmurphy/extensiblesparkbot.git

2. Update config.json file with credentials and other required details (Environmental variable BOT_TOKEN is available to store your token)
3. Run worker.js

        node worker.js

### Vagrant - VirtualBox

You can use Vagrant to build your environment for you. Two files have been included, one for a local Virtualbox install and the second for an AWS install. You may want to use AWS if you do not have a public URL available for receiving webhooks otherwise you can use the PubNub module which removes the need for a public address.

#### Prerequisites
* Vagrant
* VirtualBox

1. Clone git repository
   
    `git clone git@github.com:conmurphy/extensiblesparkbot.git`

2. Rename the VagrantFile_VB to Vagrantfile or make a copy named Vagrantfile
3. Update the config.json file with your details, including the webhookURL
4. Bring up the environment
    
    `vagrant up`

5. Log into the host

    `vagrant ssh`

6. Change directory to `/opt/extensiblesparkbot/extensiblesparkbot`

    `cd /opt/extensiblesparkbot/extensiblesparkbot`

7. Run worker

    `node worker.js`

**NOTE**: NPM may not install the packages correctly. If the worker fails on first try, change directory to `/opt/extensiblesparkbot/extensiblesparkbot` and run `npm install`

### Vagrant - AWS

You can use Vagrant to build your environment for you. Two files have been included, one for a local Virtualbox install and the second for an AWS install. You may want to use AWS if you do not have a public URL available for receiving webhooks. 

#### Prerequisites
* Vagrant
* AWS account
* AWS access keys
* AWS Subnet ID
* AWS Security Group ID
* AWS Keypair - PEM file
* PubNub account if using the pubnub load balancing module

1. Clone git repository
   
    `git clone git@github.com:conmurphy/extensiblesparkbot.git`

2. Rename the VagrantFile_AWS to Vagrantfile or make a copy named Vagrantfile
3. If you haven't already, create a new AWS Key Pair and download the file (.pem) to the current working directory
4. Create a new VPC and subnet as well as a security group if you haven't already. The security group should have port 22 SSH enabled inbound.
5. Fill in the Vagrantfile with your credentials, keypair name and the name of the `.pem` keypair file that you just downloaded
6. Add the AWS subnet ID and AWS security group ID to the Vagrantfile.
7. Bring up the environment
    
    `vagrant up`

8. Update the config.json file with your details, including the webhookURL. If you are not using the pubnub module and instead are using a single AWS VM then the webhookURL will be the address of the VM.
9. Log into the host

    `vagrant ssh`

10. Change directory to `/opt/extensiblesparkbot/extensiblesparkbot`

    `cd /opt/extensiblesparkbot/extensiblesparkbot`

11. Run worker

    `node worker.js`


**NOTE**: NPM may not install the packages correctly. If the worker fails on first try, change directory to `/opt/extensiblesparkbot/extensiblesparkbot` and run `npm install`

### Docker

A DockerFile has been included with the repo. Use the following steps to build and run a worker bot.

#### Prerequisites
* Docker

1. Clone git repository
   
    `git clone git@github.com:conmurphy/extensiblesparkbot.git`

2. Update the config.json file with your details, including the webhookURL.

3. Build the Docker image and tag it with your name. Don't forget to include the `.`

    `docker build -t yourname/extensiblesparkbot .`

4. a. If you have included your commands and config file within the built container image then you do not need to mount the volumes 

    `docker run -p 80 -p 443 yourname/extensiblesparkbot`

    b. If you have not included your command and config files in your built Docker image then you need to provide these to each container. One way is to mount a volume on each host running the worker bot containers and ensure the commands and config files exist within these directories on the host. This also allows you to update these files without rebuilding the image
   
    `docker run -v /opt/extensiblesparkbot/config:/opt/extensiblesparkbot/config -v /opt/extensiblesparkbot/commands:/opt/extensiblesparkbot/commands -p 80 -p 443 yourname/extensiblesparkbot`

### Docker Compose

Here is a sample Docker Compose file for bringing up an environment. Be sure to include a bot token in either the config file or the environmental variable below.

docker-compose.yml

```
version: '2'
services:
  worker:
    image: yourname/extensiblesparkbot
    environment:
      BOT_TOKEN: 
    stdin_open: true
    volumes:
    - /opt/extensiblesparkbot/config:/opt/extensiblesparkbot/config
    - /opt/extensiblesparkbot/commands:/opt/extensiblesparkbot/commands
    tty: true
```

### Rancher Compose

Here is a sample Rancher compose and Docker compose file for use with Rancher. This example is using external load balancing (HAProxy) not the PubNub module

docker-compose.yml

```
version: '2'
services:
  worker:
    image: yourname/extensiblesparkbot
    environment:
      BOT_TOKEN:
    stdin_open: true
    volumes:
    - /opt/extensiblesparkbot/config:/opt/extensiblesparkbot/config
    - /opt/extensiblesparkbot/commands:/opt/extensiblesparkbot/commands
    tty: true
    labels:
      io.rancher.container.pull_image: always
  haProxy:
    image: rancher/lb-service-haproxy:v0.4.2
    ports:
    - 80:80/tcp
    labels:
      io.rancher.container.agent.role: environmentAdmin
      io.rancher.container.create_agent: 'true'
      io.rancher.scheduler.global: 'true'
```

rancher-compose.yml

```
version: '2'
services:
  worker:
    scale: 3
  haProxy:
    lb_config:
      certs: []
      port_rules:
      - priority: 1
        protocol: http
        service: extensiblesparkbot/worker
        source_port: 80
        target_port: 3000
    health_check:
      healthy_threshold: 2
      response_timeout: 2000
      port: 42
      unhealthy_threshold: 3
      interval: 2000
```

## Files

### Descriptions
----

| File | Description |
|----------|----------------|
| worker.js | Main worker module - Provides initialisation of worker bot including command reference parsing and Spark connection setup |
| utils.js | Shared utilities for functions such as comand validation and command parsing |
| clusteringModules.js | No real purpose other than to keep a list/reference of available clustering/LB modules used with the bot |
| commandFunctions.js | No real purpose other than to keep a list/reference of available command functions used with the bot |
| none.js | Used when no load balancing/clustering is required or external load balancer/clustering is used |
| pubnub.js | Utilises PubNub.com service to provide basic load balancing amongst worker bots to respond to messages |
| commands.json | Command reference file - This name can change and multiple command files can be used. See config file example above for reference|
| config.json | Config file used by worker bots|

### Config
----

The config file stores details such as Spark tokens, admins, restricted rooms, command references and additional modules. 

**NOTE**: You will notice the config.json file is split into environments such as development or production. You can set the environment (e.g. development, production) from the environment variable NODE_ENV. If this is not set then the default is environment development.


#### Main Config File
| Name | Description | Can Be Empty? | Comments |
|----|----|-----------|--------|---------|
|token | Token used to authenticate the Spark bot  | No | Leave blank if using environmental variable - BOT_TOKEN |
|botEmail | Email used by the Spark bot  | No | |
|admin | Contains the list of admin  | Yes  | |
|restrictedRooms | Provides ability to restrict some rooms from Spark bot  | Yes | |
|firstArgument | First argument to call the bot e.g. /myBot and points to the command file reference for this argument| No | |
|commandReference | Command file reference used with the first argument. As per example you can have multiple ways to call a bot with each method referencing a different file| No | |
|requiresAdmin| Whether or not this set of commands can be used by everyone or just an admin  | No | |
|allowExternal| Whether or not this set of commands can be used by only the users which match the internalDomain or by everyone | No | |
|accessBehaviour| How we control internal and external access to a room with this bot | No | |
|internalDomain| Used to decide whether or not a user should be allowed within a room | No | |
|removeExternal| When true if a person enters a room with a email domain that doesn't match the internalDomain they will be remove. If false, they will not be removed | No | |
|clustering| Module and attributes to use for clustering/load balancing. Currently two options available, none and pubnub | No | |
|none| This module does not provide an clustering or load balancing. Use with either single worker or external LB. See below for further details | No | |
|pubnub| Module to provide very basic load balancing using the pubnub service. See below for further details | No | |



#### Sample Config File

```js


{
    "config": {
        "development": {
            "worker": {
                "token": "myToken",
                "botEmail": "email@mySparkBot.com",
                "admin": {
                    "1": "admin1@someCompany.com",
                    "2": "admin2@someCompany.com"
                },
                "restrictedRooms": {
                    "1": "Rooms with Lots of People",
                    "2": "Restricted Room 2",
                    "3": "My Spark Room"
                },
                "accessBehaviour": {
                    "internalDomain": "myInternalDomain.com",
                    "removeExternal": "false"
                },
                "firstArgument": {
                    "/myBot": {
                        "commandReference": "commands.json",
                        "requiresAdmin": "false",
                        "allowExternal": "true" 
                    },
                    "/myBot-admin": {
                        "commandReference": "commands-admin.json",
                        "requiresAdmin": "true",
                        "allowExternal": "false" 
                    }
                },
                "/infra": {
                    "commandReference": "infra-commands.json",
                    "requiresAdmin": "false"
                },
                "clustering": {
                    "none": {
                        "listeningPort": "3000",
                        "webhookChannel": "bot",
                        "webhookURL": "http://botIPAddress/bot/"
                    }
                }
            }

        },
        "production": {
            "worker": {

            }
        }
    }
}

```

### Command References
----

You can use the conmurph/commandbuilder GUI to build command trees. Alternatively you can build command references manually.

#### Manual Command Reference

The following outlines the correct structure for your JSON command file.


#### Performing an Action

Each level is referred to as a "branch" of a command, with the final "leaf" of the command containing the action to take. For example in the sample reference below, "what is your name" is the command branch and the final leaf object contains the detail. In this example case it is a readonly command and will return some detail, ""My name is Weather Bot". 

There are two commandTypes for leafs, **readonly** and **function**

Command type: **readonly**

Requires:
**detail**

* **readonly** simply returns the string contained within **detail**

Command type: **function**

Requires:
**function**

* The **function** referenced in this commandType is called by the worker bot. 


#### Accepting User Input

For some commands you may wish to request user input. For example in the sample reference below a function, checkWeather, is called which requires the user to input the location for which they would like to return the weather report.

In this case you can use **$$** as a command branch to indicate that user input will be accepted. 

Following the **$$** must be the **argumentName**. This allows you to specify a name or key for the argument which will be passed to your function. The user input will be passed to the function as the value assigned. See checkWeather for the example code.

#### Usage and Available Subcommands

When creating a command tree through the Command Builder GUI the usage report and available subscommands are automatically created. When manually creating this file please include **usage** for the current level. See sample command tree for reference.

#### Sample Command Reference

```js

{
    "hello": {
        "commandType": "readonly",
        "detail": "hi",
        "usage": "Usage: /myBot hello  \n \n    Available Subcommands: \n        "
    },
    "what": {
        "is": {
            "your": {
                "name": {
                    "commandType": "readonly",
                    "detail": "My name is Weather Bot",
                    "usage": "Usage: /myBot what is your name  \n \n    Available Subcommands: \n        "
                },
                "age": {
                    "commandType": "readonly",
                    "detail": "100",
                    "usage": "Usage: /myBot what is your age  \n \n    Available Subcommands: \n        "
                },
                "purpose": {
                    "commandType": "readonly",
                    "detail": "My purpose is to assist you with finding the weather",
                    "usage": "Usage: /myBot what is your purpose  \n \n    Available Subcommands: \n        "
                },
                "usage": "Usage: /myBot what is your  <command> \n \n    Available Subcommands: \n        name \n        age \n        purpose \n        "
            },
            "usage": "Usage: /myBot what is  <command> \n \n    Available Subcommands: \n        your \n        "
        },
        "usage": "Usage: /myBot what  <command> \n \n    Available Subcommands: \n        is \n        "
    },
    "check": {
        "weather": {
            "$$": {
                "commandType": "function",
                "function": "checkWeather",
                "usage": "Usage: /myBot check weather  <text> \n \n    Available Subcommands: \n        "
            },
            "argumentName": "city",
            "usage": "Usage: /myBot check weather  <command> \n \n    Available Subcommands: \n        <text> \n        "
        },
        "usage": "Usage: /myBot check  <command> \n \n    Available Subcommands: \n        weather \n        "
    },
    "usage": "Usage: /myBot  <command> \n \n    Available Subcommands: \n        hello \n        what \n        check \n        "
}

```

## Load Balancing/Clustering


### None
----

This module can be used when running a single worker or multiple workers behind an external load balancer. For example HAProxy or AWS ELB. The webhook target URL in the config file will be the address of either the host that the worker is running on, in the case of a single worker, or the VIP of the external load balancer.

#### Main Config File - Clustering - None

| Name | Description | Can Be Empty? | Comments |
|------|-------------|---------------|----------|
| listeningPort | The port on which the bot should listen for messages | No | |
| webhookChannel | The channel or route that should be used e.g. itsMyBot | No | |
| webhookURL | The URL that should be used by Spark for the webhook. e.g. the address of the host/VM. You will need to included the webhookChannel at the end of the URL. e.g. http://botIPAddress/itsMyBot/ | No | |

#### Prerequisites
* Replace the webhookchannel in the webhookURL with the channel you would like to use.

![alt tag](https://github.com/conmurphy/extensiblesparkbot/blob/master/images/none.png?raw=true)

![alt tag](https://github.com/conmurphy/extensiblesparkbot/blob/master/images/externalLB.png?raw=true)

#### Sample Config File - No Clustering/Load Balancing

```js


{
    "config": {
        "development": {
            "worker": {
                "token": "myToken",
                "botEmail": "email@mySparkBot.com",
                "admin": {
                    "1": "admin1@someCompany.com",
                    "2": "admin2@someCompany.com"
                },
                "restrictedRooms": {
                    "1": "Rooms with Lots of People",
                    "2": "Restricted Room 2",
                    "3": "My Spark Room"
                },
                "accessBehaviour": {
                    "internalDomain": "myInternalDomain.com",
                    "removeExternal": "false"
                },
                "firstArgument": {
                    "/myBot": {
                        "commandReference": "commands.json",
                        "requiresAdmin": "false"
                    },
                    "/myBot-admin": {
                        "commandReference": "commands-admin.json",
                        "requiresAdmin": "true"
                    }
                },
                "/infra": {
                    "commandReference": "infra-commands.json",
                    "requiresAdmin": "false"
                },
                "clustering": {
                    "none": {
                        "listeningPort": "3000",
                        "webhookChannel": "bot",
                        "webhookURL": "http://botIPAddress/bot/"
                    }
                }
            }

        },
        "production": {
            "worker": {

            }
        }
    }
}

```

### PubNub
----

The PubNub module provides a simple mechanism for running the Extensible Spark Bot and provides connectivity when a public URL is not available. Multiple workers can be used with the pubnub module and there is a basic election/load balancing function built in to select the worker which will respond to the request.

NOTE: This is only a very simple module and does not take into account things such as master election or split brain scenarios which may occur. It is recommended for small proof of concepts only.

Replace the channel and the keys in the webhookURL with your own.

| Name | Description | Can Be Empty? | Comments |
|------|-------------|---------------|----------|
| pubKey | Publisher key provided by pubnub. e.g. pubKey-abcd1234 | No | You can find the publisher key from your Pubnub account |
| subKey | Subscriber key provided by pubnub. e.g. subKey-abcd1234 | No | You can find the subscriber key from your Pubnub account |
| pubnubChannel | The Pubnub channel that should be used for messages e.g. itsMyBot | No |  This needs to be setup in your Pubnub account  |
| pubnubAdminChannel | The Pubnub admin channel that should be used for admin messages e.g. itsMyBot-admin| No |  This needs to be setup in your Pubnub account  |
| webhookURL | The URL that should be used by Spark for the webhook. You will need to included the pubnubChannel and pub/sub keys within the URL, the rest of the URL will remain the same as follows. e.g. http://pubsub.pubnub.com/publish/pubKey-abcd1234/subKey-abcd1234/0/itsMyBot/0/ | No | |

#### Prerequisites
* Replace the webhookchannel in the webhookURL with the channel you would like to use.
* PubNub.com account 
* NTP on each host

![alt tag](https://github.com/conmurphy/extensiblesparkbot/blob/master/images/pubnub.png?raw=true)

#### Sample Config File - Using PubNub Module

```js

{
    "config": {
        "development": {
            "worker": {
                "token": "myToken",
                "botEmail": "email@mySparkBot.com",
                "admin": {
                    "1": "admin1@someCompany.com",
                    "2": "admin2@someCompany.com"
                },
                "restrictedRooms": {
                    "1": "Rooms with Lots of People",
                    "2": "Restricted Room 2",
                    "3": "My Spark Room"
                },
                "accessBehaviour": {
                    "internalDomain": "myInternalDomain.com",
                    "removeExternal": "false"
                },
                "firstArgument": {
                    "/myBot": {
                        "commandReference": "commands.json",
                        "requiresAdmin": "false"
                    },
                    "/myBot-admin": {
                        "commandReference": "commands-admin.json",
                        "requiresAdmin": "true"
                    }
                },
                "/infra": {
                    "commandReference": "infra-commands.json",
                    "requiresAdmin": "false"
                },
                "clustering": {
                    "pubnub": {
                        "pubKey": "myPublisherKey",
                        "subKey": "mySubscriberKey",
                        "pubnubChannel": "myChannel",
                        "pubnubAdminChannel": "myAdminChannel",
                        "webhookURL": "http://pubsub.pubnub.com/publish/myPublisherKey/mySubscriberKey/0/myChannel/0/"
                    }
                }
            }

        },
        "production": {
            "worker": {

            }
        }
    }
}

```

# Custom Modules

The Spark bot can return basic text as part of a `readonly` command or alternatively you can have a command call a custom function. e.g you may have a command `spark list rooms` which calls a function named `listRoom`

You can also call custom functions which accept user input e.g. `check weather $$`

## Writing Custom Module - No User Input

1. As per the command samples above to call a custom function the command needs to provide the following:

        "commandType": "function"
        "function": "listRooms"


2. Create a new file with the functionName.js and add it to the `modules` folder. This can be within the root modules folder or any additional nested folder. This will be referenced in the next step. Have a look at the listRooms.js sample function to see the structure of a module.

        var env = process.env.NODE_ENV || 'development';
        var config = require('../../config/config')['config'][env];
        var utils = require('../../utils/common');

        module.exports = {
        
            listRooms: function(messageArgs, spark, message) {
        
                spark.roomsGet()
                    .then(function(rooms) {
        
                        var textToSend = 'Spark Rooms Containing Bot: \n\n';

                        rooms.forEach(function(room) {

                            if (!utils['checkExists'](room.title, config.worker.restrictedRooms)) {
                                textToSend += room.title + '\n';
                            } else {
                                textToSend += room.title + ' (RESTRICTED ROOM FOR POSTING)\n';
                            }
        
                        });

                        spark.messageSendRoom(message.roomId, {
                                text: textToSend
                            })
                            .then(function() {
        
                            })
                            .catch(function(err) {
                                console.log(err);
                            });
                    })
                    .catch(function(err) {
                        // process error
                        console.log(err);
                    });

            }
        }

    In this case the `messageArgs` will be empty as we are not requesting user input within this command. `spark` will be used to send our message to a specific room. `message` is the message or command that was received by the worker bot.

    You can use the following framework to start building your own custom function.

        var env = process.env.NODE_ENV || 'development';
        var config = require('../../config/config')['config'][env];
        var utils = require('../../utils/common');

        module.exports = {
   
            yourCustomFunction: function(messageArgs, spark, message) {

            }
        }
        


3. The final step is to add this module to the `commandFunctions.js` file. At the top of `commandFunctions.js` add the `require` statement. Here is an example:


    `var listRooms = require('./modules/sample/listRooms');`



4. Add the function within the `module.exports` component. Here is an example:


        listRooms: function(messageArgs, spark, message) {
     	
            listRooms['listRooms'](messageArgs, spark, message);
     
        }


## Writing Custom Module - User Input

1. Create your command which accepts user input. For example `check weather $$`. In this case the `$$` in the command represents user input. The sample command file above has an example of this function call and you will notice that when you accept user input you also require an `argumentName`. 

        "check": {
	        "weather": {
		        "$$": {
			        "commandType": "function",
			        "function": "checkWeather",
			        "usage": "Usage: /myBot check weather  <text> \n \n    Available Subcommands: \n        "
		        },
		        "argumentName": "city",
		        "usage": "Usage: /myBot check weather  <command> \n \n    Available Subcommands: \n        <text> \n        "
	        },
	        "usage": "Usage: /myBot check  <command> \n \n    Available Subcommands: \n        weather \n        "
        }


2. Create a new file with the functionName.js and add it to the `modules` folder. This can be within the root modules folder or any additional nested folder. This will be referenced in the next step. Have a look at the checkWeather.js sample function to see the structure of a module.


        var utils = require('../../utils/common');
        var env = process.env.NODE_ENV || 'development';
        var config = require('../../config/config')['config'][env];

        //Using https://www.npmjs.com/package/weather-js
        var weather = require('weather-js');

        module.exports = {

            checkWeather: function(messageArgs, spark, message) {

                var textToSend = '';

                if (messageArgs.length == 1) {
            
                    firstArgument = messageArgs[0].pop();
                    messageID = firstArgument.messageID;
                    city = firstArgument.value;

                    weather.find({
                        search: city,
                        degreeType: 'C'
                    }, function(err, result) {
                        if (err) console.log(err);

                        textToSend += 'Weather Report: \n \n- City: ' + result[0].location.name + ' \n- Oberservation Time: ' + result[0].current.observationtime + ' \n- Current Temperature: ' + result[0].current.temperature + " \n- Feels like: " + result[0].current.feelslike + result[0].location.degreetype + " \n- Sky Conditions: " + result[0].current.skytext + " \n- Humidity: " + result[0].current.humidity + " \n- Windspeed: " + result[0].current.winddisplay;

                        spark.messageSendRoom(message.roomId, {
                                markdown: textToSend
                            })
                            .then(function() {

                            })
                            .catch(function(err) {
                                console.log(err);
                            });

                    });

                }

            }
        }

    In this case the `messageArgs` will contain the user input specifying their city.  `spark` will be used to send our message to a specific room. `message` is the message or command that was received by the worker bot.

    You can use the following framework to start building your own custom function.

        var env = process.env.NODE_ENV || 'development';
        var config = require('../../config/config')['config'][env];
        var utils = require('../../utils/common');

        module.exports = {
   
            yourCustomFunction: function(messageArgs, spark, message) {

            }
        }

    The `messageArgs` contains the following for each argument that the user inputs.

    `{'messageID':messageID,'personEmail':personEmail, 'argumentName':argumentName, 'value':value}`


3. The final step is to add this module to the `commandFunctions.js` file. At the top of `commandFunctions.js` add the `require` statement. Here is an example:


    `var checkWeather = require('./modules/sample/checkWeather');`


4. Add the function within the `module.exports` component. Here is an example:

        checkWeather: function(messageArgs, spark, message) {
     	
                checkWeather['checkWeather'](messageArgs, spark, message);
     
        }
