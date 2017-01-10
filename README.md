# Index Builder [![Build Status](https://travis-ci.org/Abhisheksharma01/mongo-index-builder.svg?branch=master)](https://travis-ci.org/Abhisheksharma01/mongo-index-builder) [![Coverage Status](https://coveralls.io/repos/github/Abhisheksharma01/mongo-index-builder/badge.svg?branch=master)](https://coveralls.io/github/Abhisheksharma01/mongo-index-builder?branch=master)

> Mongo index builder will help in creating indexes as part of the application deployment and would help in creating a self contained package.Hence will facilitate the rollback or any build deployment without worrying for the compatible indexes.The package can list the compatible indexes and take use of index builder to process them at the time of deployment.Index builder will create/drop the indexes incremently without repeating the job.

## Problem Statement

   Normally the indexes are build separately from the consumer applications and so far the compatibility of indexes with it has been managed manually.
   which is error prone and it is being hard to manage the rollback or deployment of different version of the application across all the environment.


## Probable solution

   The indexes should be build by the consumer itself by taking in account all the compatibility issues.
   So this utility will help in making compatible indexes as part of the application deployment.And Hence 
   will facilitate the rollback or any build deployment without worrying for the compatible indexes.


## How to use

###To install **mongo-index-builder**
```bash
npm install mongo-index-builder --save
```
###To import **mongo-index-builder**
```javascript
var mongoIndexBuilder = require("mongo-index-builder");
```
### Working Sample written in es6
 ```
 import mongoIndexBuilder from "mongo-index-builder";
 
 const mongoConfig = {
   "connectionString": "mongodb://test:test@address:port/db",
   "operationTimeout": 5000
 };
 const loggerConfig = {
   "streams": [{
     "level": "info",
     "path": "./mongo-index-builder.log"
   }],
   "name": "My-logger"
 };
 const indexes = [
   {
     "collectionName": "TestMongoIndexer",
     "indexName": "acss",
     "indexKeys": [
       {
         "keyName": "a",
         "keySortOrder": 1.0
       }
     ]
   },
   {
     "collectionName": "TestMongoIndexer",
     "indexName": "b",
     "indexKeys": [
       {
         "keyName": "b",
         "keySortOrder": 1.0
       }
     ]
   },
   {
     "collectionName": "TestMongoIndexer2",
     "indexName": "ba",
     "indexKeys": [
       {
         "keyName": "ba",
         "keySortOrder": 1.0
       }
     ]
   }
 
 ];
 
 const MongoIndexBuilder = new mongoIndexBuilder({mongoConfig, loggerConfig});
 
 MongoIndexBuilder.buildIndexes(indexes)
 .then(response => {
   console.log(response);
 }
 ).catch(error => console.log(error.message));
 

 ```

###The constructor Api
```javascript
const MongoIndexBuilder = new mongoIndexBuilder({ mongoConfig: mongoConfig, loggerConfig: loggerConfig });
```
- **mongoConfig** : Mongo Db config : Mandatory :
   Mongo Config Structure and Example:
     ```
     {
      	"connectionString": String().required().description("The mongo db connection string"),
      	"operationTimeout": Number().description("The operation timeout for mongo operations.")
      }).required().example({
      	"connectionString": "mongo://userName:Password@address:port/db",
      	"operationTimeout": 5000
      }) 
     } 
     ```
  
- **loggerConfig** : Logger Config : Not Mandatory : [Please Refer Bunyan](https://github.com/trentm/node-bunyan)
    
    Logger Config Example : For more info refer above link
          ```{
            "streams": [{
              "level": "fatal",
              "stream": process.stdout
            }],
            "name": "My-logger"
          ```})

###API
  - The utility exposes a class "indexBuilderService" which would take in the mongo config and logger config for 
  its construction. And would provide the following :
    - **buildIndexes(indexList)** : Function returning a promise for building the indexes
      - Index Array Structure and Example:
       ```
       [{
        	"collectionName": String().required(),
        	"indexName": String(),
        	"indexOptions": Object().keys({
        		"w": String().description("The write concern"),
        		"wtimeout": Number().description("The write concern timeout"),
        		"j": Boolean().description("Specify a journal write concern"),
        		"unique": Boolean().description("Creates an unique index"),
        		"sparse": Boolean().description("Creates a sparse index"),
        		"background": Boolean().description("Creates the index in the background, yielding whenever possible"),
        		"dropDups": Boolean().description("A unique index cannot be created on a key that has pre-existing duplicate values. If you would like to create the index anyway, keeping the first document the database indexes and deleting all subsequent documents that have duplicate value"),
        		"min": Number().description("For geospatial indexes set the lower bound for the co-ordinates"),
        		"max": Number().description("For geospatial indexes set the high bound for the co-ordinates"),
        		"v": Number().description("Specify the format version of the indexes"),
        		"expireAfterSeconds": Number().description("Allows you to expire data on indexes applied to a data (MongoDB 2.2 or higher)")
        	}),
        	"indexKeys": Array().max(31).items(Object().keys({
        		"keyName": String().required(),
        		"keySortOrder": Number().valid(1,
        		-1),
        		"keyType": String().valid("text",
        		"2d",
        		"2dsphere",
        		"geoHaystack",
        		"hashed")
        	}).xor("keySortOrder",
        	"keyType").required()).required()
        }]Example: [{
        	"collectionName": "testCollection",
        	"indexKeys": [{
        		"keyName": "propertyId",
        		"keySortOrder": 1
        	}]
        }]
        ```
    - **eventEmitter** : Event emitter to hook your own custom handlers or register more events.
      - The list of predefined events is :
        ```
        {
           "indexesSyncronisationStart": "Index syncronisation started @ : ",
           "indexCreate": "Starting index creation For :",
           "indexCreated": "Completed index creation For :",
           "indexDrop": "Starting index dropping For :",
           "indexDropped": "Completed index dropping For :",
           "indexesSyncronised": "Index syncronisation is completed.",
           "collectionNames": "List of collections to be built :",
           "indexList": "List of indexes to be created : ",
           "error": "Error in building indexes : "
        };
        ```
  - The utility also exposes a function to get singleton instance of the same class
    - **getIndexBuilder({ mongoConfig: mongoConfig, loggerConfig: loggerConfig })** : Function takes in the same mongo and logger config.
  

  
## Basic design

!["Index Builder Design"](./indexBuilder.jpg)


## Things to consider
  - The indexes will only be built on Primary in case of replica set and they should then automatically be created
  on the secondary nodes.
  - The consumer application should only make itself available after building its required indexes(Promise resolved)
  - This Process will be incremental : existing indexes will not be rebuild
  - The list of indexes provided to the utility should be made part of the build so that in furure the build should
  know of all the indexes required.

## How does it work for API

!["I work like this"](./HowItWorks.jpg)

- The utility would take in the list of indexes to build in a specified format
  - Format : 
  ```
  "collectionName": "dashboardAvailabilities",
                   "indexKeys": [{
                     "keyName": "propertyId",
                     "keySortOrder": 1
                   }]
                   ```
- It would iterate across the multiple collection and would only act on the new indexes to build or no longer required indexes
to be dropped.
- So it would work exactly the same way as other dependencies are working and any application package would always know which indexes are required
by which build.
  -  Query to fetch indexes from exiting collections from db in the required format :

```
   var formattedResult =[];

   var abc = function(index) {
               const indexKeys = index.key;
               const formattedKeys = [];

               for (var indexKey in indexKeys) {
                         formattedKeys.push({
                                 "keyName": indexKey,
                                 "keySortOrder": indexKeys[indexKey]
                               })
                           }

                   return formattedKeys;
               };
   db.getCollection('collectionName').getIndexes().forEach(function(index){
         formattedResult.push({
           "collectionName": index.ns.split(".")[1],
           "indexName": index.name,
           "indexKeys": abc(index)
         })
       })
        print( formattedResult);
```


