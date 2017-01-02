# Index Builder

## Problem Statement

   The indexes are build separately from the api and so far the compatibility of indexes with api has been managed manually.
   which is error prone and it is being hard to manage the rollback or deployment of different version of api across all the environment.
   The same problem exist for loaders.


## Probable solution

   The indexes should be build by the consumer itself by taking in account all the compatibility issues.
   So for API, this plugin will help in making compatible indexes as part of the api deployment.
   Hence will facilitate the rollback or any build deployment without worrying for the compatible indexes.

## Various components
  - Core scripts : Its would a node package which would provide the basic services to build the required indexes.
    And these scripts would investigate to only update/create/drop the desired indexes. it is NOT A FULL DROP AND RECREATE function.
  - API index builder Plugin : This plugin would consume these services and would provide them the list of indexes required by that
  particular version of API and would also provide mongodb driver to the services.
  - DB services : As we are already using underlying services to facilitate the interaction of api with database.
   So the indexes would also be defined there itself along with the repositories by taking in consideration the queries used for collection.
   And hence they would also be exported to the consumers.
  - Loader : As per the bootstrapping process.Loader would also consume these services and would build its indexes required.

## Basic design

!["Index Builder Design"](./indexBuilder.jpg)


## Things to consider
  - The indexes should only be built on Primary in case of replicaset
  - Loader or API should only start working or made itself available after building its required indexes
  - This Process should be incremental : existing indexes should not be rebuild
  - The services should follow the same semantic versioning process and notify with a breaking change if
  it can impact the api/loader functioning

## How does it work for API

!["I work like this"](./HowItWorks.jpg)

- The plugin would take in the list of indexes to build in a specified format
  - Format : "collectionName": "dashboardAvailabilities",
                   "indexKeys": [{
                     "keyName": "propertyId",
                     "keySortOrder": 1
                   }]
- It would iterate across the multiple collection and would only act on the new indexes to build or no longer required indexes
to be dropped.
- The existing indexes would be ported to a services npm package in the above specified format
- So it would work exactly the same way as other dependencies are working and api would always know which indexes are required
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
   db.getCollection('dashboardInvestmentDeals').getIndexes().forEach(function(index){
         formattedResult.push({
           "collectionName": index.ns.split(".")[1],
           "indexName": index.name,
           "indexKeys": abc(index)
         })
       })
        print( formattedResult);
```

## Below are the tasks for implementing this thing

- [x] Create plugin for building indexes
- [ ] Create health check for the plugin for building indexes
- [ ] devise the bootstrapping process for Loader
- [ ] Extract the index building scripts to a separate package
- [ ] write unit test cases for the index building scripts
- [ ] write unit test cases for all types of indexes and their build process options
- [ ] port the exiting indexes into services package

