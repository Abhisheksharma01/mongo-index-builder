import Q from "q";
import * as Hoek from "hoek";
import {indexListSchema, loggerSchema, mongoConfigSchema} from "./schema(s)";
import ValidateSchema from "./validateSchema";
import ThrowWrappedError from "./ThrowWrappedError";
import {getDbConnectionManager} from "./services/mongo-connection-factory";
import MongodbClient from "./services/mongoService";
import * as Mongodb from "mongodb";
import Logger from "./services/logger";
import Joi from "joi";
import {EventEmitter} from "events";
import * as customEvents from "./customEvents";

let protectedInstance;
let defaultLoggerConfig = {
  "streams": [{
    "level": "trace",
    "stream": process.stdout
  }]
};
// let internals;
const map = new WeakMap();
function getPrivateHub(object) {

  if (!map.has(object)) {
    map.set(object, {});
  }
  return map.get(object);
}

/**
 * Services for building indexes in database
 * @class indexBuilderService
 * @param {Object} mongoConfig - Mongo db congif values
 * @param {Object} loggerConfig - Logger configurations
 */
export default class indexBuilderService {

  constructor({mongoConfig, loggerConfig, dataService, MockLogger, MockEventEmitter}) {

   // internals = getPrivateHub(this);

    if (!MockLogger) {
      if (loggerConfig) {

        defaultLoggerConfig = Joi.attempt(loggerConfig, loggerSchema, "Logger configuration is not in the required format");
      }
      getPrivateHub(this).loggerService = new Logger(defaultLoggerConfig);
    } else {
      getPrivateHub(this).loggerService = MockLogger;
    }

    if (!dataService) {
      Joi.assert(mongoConfig, mongoConfigSchema, "Mongo DB configuration is not in the required format");
      getPrivateHub(this).dataService = new MongodbClient({
        "mongoConnectionFactory": getDbConnectionManager({
          "logger": getPrivateHub(this).loggerService,
          "nativeDriver": Mongodb,
          "connectionString": mongoConfig.connectionString,
          "ioTimeout": mongoConfig.operationTimeout || 5000
        }),
        "loggerService": getPrivateHub(this).loggerService
      });
    } else {
      getPrivateHub(this).dataService = dataService;
    }

    getPrivateHub(this).indexDropList = [];
    getPrivateHub(this).indexCreateList = [];

    /**
     * Function to create indexes in a collection
     * @param {Array<Objects>} createList - Array of objects containing index information
     * @returns {Promise.<Any>} - The result object or Error
     * @private
     */
    getPrivateHub(this).createIndexes = function (createList) {

      let promise = Promise.resolve(null);


      for (const index of createList) {

        const indexKeys = {};
        const indexOptions = {};

        index.indexKeys.forEach(indexKey => {
          indexKeys[indexKey.keyName] = indexKey.keySortOrder;
        });
        if (index.indexName) {
          indexOptions.name = index.indexName;
        }

        if (index.indexOptions) {
          Object.assign(indexOptions, index.indexOptions);
        }
        this.eventEmitter.emit(customEvents.indexEvents.indexCreate, `Keys : ${Hoek.stringify(indexKeys)}, Options : ${Hoek.stringify(indexOptions)}`);

        promise = promise
          .then(() => getPrivateHub(this).dataService.createIndex(index.collectionName, indexKeys, indexOptions))
          .then(() => this.eventEmitter.emit(customEvents.indexEvents.indexCreated, `Keys : ${Hoek.stringify(indexKeys)}, Options : ${Hoek.stringify(indexOptions)}`));
      }

      return promise;
    }.bind(this);

    /**
     * Function to drop indexes in a collection
     * @param {Array<Objects>} dropList - Array of objects containing index information
     * @returns {Promise.<Any>} - The result object or Error
     * @private
     */
    getPrivateHub(this).dropIndexes = function (dropList) {
      let promise = Promise.resolve(null);

      for (const index of dropList) {

        this.eventEmitter.emit(customEvents.indexEvents.indexDrop, index.indexName);
        promise = promise
          .then(() => getPrivateHub(this).dataService.dropIndex(index.collectionName, index.indexName))
          .then(() => this.eventEmitter.emit(customEvents.indexEvents.indexDropped, index.indexName));
      }

      return promise;
    }.bind(this);

    /**
     * Function to extract and format index keys in desired format
     * @param {objects} indexKeys - Object containing keys of an index
     * @returns {object} - The result object or Error
     * @private
     */
    getPrivateHub(this).extractKeys = function (indexKeys) {
      const formattedKeys = [];
      Object.keys(indexKeys).forEach(indexKey => formattedKeys.push({
        "keyName": indexKey,
        "keySortOrder": indexKeys[indexKey]
      }));

      return formattedKeys;
    };

    /**
     * Function to format index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<Object>} - The result array containing formatted objects or Error
     * @private
     */
    getPrivateHub(this).formatResult = function (indexList) {
      const formattedResult = [];
      indexList.forEach(index => {
        formattedResult.push({
          "collectionName": index.ns.split(".")[1],
          "indexName": index.name,
          "indexKeys": getPrivateHub(this).extractKeys(index.key)
        });
      });

      return formattedResult;
    }.bind(this);

    /**
     * Function to get collection names out of index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<String>} - The result array containing unique collection names
     * @private
     */
    getPrivateHub(this).getCollectionNames = function (indexList) {

      const collectionList = Hoek.unique(indexList.map(index => index.collectionName));
      this.eventEmitter.emit(customEvents.indexEvents.collectionNames, collectionList.join());

      return collectionList;
    }.bind(this);

    /**
     * Function to get index sync promises for the provided index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<Promise>} - The result array containing sync promises
     * @private
     */
    getPrivateHub(this).getIndexSyncPromises = function (indexList) {

      const collectionIndexListPromises = [];
      getPrivateHub(this).indexCreateList = indexList;
      getPrivateHub(this).getCollectionNames(indexList).forEach(collection => {
        collectionIndexListPromises.push(getPrivateHub(this).dataService.getIndexes(collection)
          .then(result => {
            let indexPosition;
            getPrivateHub(this).formatResult(result).forEach(index => {
              if ((indexPosition = indexList.findIndex(indexToBeCreated => Hoek.deepEqual(indexToBeCreated, index, {"prototype": false}))) === -1) {
                getPrivateHub(this).indexDropList.push(index);
              } else {
                getPrivateHub(this).indexCreateList.splice(indexPosition, 1);
              }
            });
          }));
      });

      return collectionIndexListPromises;
    }.bind(this);

    /**
     * Function to register handlers for index building process
     * @param {Object} eventEmitter - Event Emitter
     * @param {Object} eventsToRegister - Object containing events to register along with their messages
     * @returns {Void} - returns void.
     * @private
     */
    getPrivateHub(this).registerEvents = function (eventEmitter, eventsToRegister) {

      Object.keys(eventsToRegister).forEach(eventName => {

        eventEmitter.on(eventName, info => {

          getPrivateHub(this).loggerService.info(eventsToRegister[eventName] + info);
        });
      });
    }.bind(this);

    /**
     * Function to handle error.
     *
     * @param {Error} error  error object.
     * @returns {void}
     * @private
     */
    getPrivateHub(this).errorHandler = function (error) {
      getPrivateHub(this).loggerService.error({"error": error});
      throw error;
    }.bind(this);

    this.eventEmitter = MockEventEmitter || new EventEmitter();
    getPrivateHub(this).registerEvents(this.eventEmitter, customEvents.indexEvents);

  }

  /**
   * Function to create indexes in a database
   * @param {Array<Objects>} indexList - Array of objects containing index information
   * @returns {Promise.<Any>} - The result object or Error
   * @public
   */
  buildIndexes(indexList) {

    try {
      this.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronisationStart, Hoek.stringify(new Date()));

      return ValidateSchema(indexList, indexListSchema, "Schema validation failed")
        .then(validatedIndexList => Q.all(getPrivateHub(this).getIndexSyncPromises(validatedIndexList)))
        .then(() => getPrivateHub(this).dropIndexes(getPrivateHub(this).indexDropList))
        .then(() => getPrivateHub(this).createIndexes(getPrivateHub(this).indexCreateList))
        .then(() => this.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronised, Hoek.stringify(new Date())))
        .catch(error => {

          this.eventEmitter.emit(customEvents.indexEvents.Error, error.message);
          return getPrivateHub(this).errorHandler(ThrowWrappedError(`Error in building indexes : ${error.message}`, error));
        });
    } catch (error) {

      return Promise.reject(error);
    }
  }
}


/**
 * Returns mongo index builder singleton
 * @param {Object} mongoConfig - Mongo db congif values
 * @param {Object} loggerConfig - Logger configurations
 * @returns {indexBuilderService}  The index builder singleton instance
 */
export function getIndexBuilder({mongoConfig, loggerConfig, dataService, MockLogger}) {

  protectedInstance = protectedInstance || new indexBuilderService({mongoConfig, loggerConfig, dataService, MockLogger});
  return protectedInstance;
}

