import * as Q from "q";
import * as customErrors from "./../customErrors";

/**
 * Services for interacting with database
 * @class MongodbClient
 * @param {mongoConnectionFactory} mongoConnectionFactory - connection factory for Mongo
 * @param {LoggerService} loggerService - It logs when executed
 */
export default class MongodbClient {

  /**
   * Function :: To initialize object properties
   * @param {Function} mongoConnectionFactory - the callback which connects to database and return it's instance
   * @param {Object} loggerService - the logger service
   */
  constructor({mongoConnectionFactory, loggerService}) {


    if (!mongoConnectionFactory) {

      throw new customErrors.argumentUndefined("mongoConnectionFactory");
    }

    if (!loggerService) {

      throw new customErrors.argumentUndefined("loggerService");
    }

    this.logger_ = loggerService;
    this.mongoConnectionFactory_ = mongoConnectionFactory;
  }

  /**
   * Function to create an index for a collection
   * @param {string} collectionName - Name of the collection
   * @param {object} indexKeys - Object containing index keys
   * @param {object} indexOptions - options for mongodb for building the indexes
   * @returns {Promise.<Any>} - created index name or Error
   * @public
   */
  createIndex(collectionName, indexKeys, indexOptions) {

    return this.mongoConnectionFactory_.getConnection()
      .then(({db}) => {
        const coll = db.collection(collectionName);

        return Q.npost(coll, "createIndex", [indexKeys, (indexOptions ? indexOptions : null)]);
      })
      .catch(err => this.logAndThrowError_(err, this.createIndex.name));
  }

  /**
   * Function to create an index for a collection
   * @param {string} collectionName - Name of the collection
   * @param {string} indexName - name of the index
   * @returns {Promise.<Any>} - The result object or Error
   * @public
   */
  dropIndex(collectionName, indexName) {

    return this.mongoConnectionFactory_.getConnection()
      .then(({db}) => {
        const coll = db.collection(collectionName);

        return Q.npost(coll, "dropIndex", [indexName]);
      })
      .catch(err => this.logAndThrowError_(err, this.dropIndex.name));
  }

  /**
   * Function to fetch indexes for a collection
   * @param {string} collection - Name of the collection
   * @returns {Promise.<Any>} - Array of objects (indexes) or Error
   * @public
   */
  getIndexes(collection) {

    return this.mongoConnectionFactory_.getConnection()
      .then(({db}) => {
        const coll = db.collection(collection);

        return Q.npost(coll, "indexes");
      })
      .catch(err => this.logAndThrowError_(err, this.getIndexes.name));
  }

  /**
   * Function - To log and throw error
   * @param {Error} err - error object
   * @param {string} functionName - The name of the function that the error
   * occured in.
   * @returns {Void} - Void
   * @throws err
   * @private
   */
  logAndThrowError_(err, functionName) {

    this.logger_.error(`MongoService -- ${functionName} : Unexpected error occurred`, err);

    throw err;
  }

}
