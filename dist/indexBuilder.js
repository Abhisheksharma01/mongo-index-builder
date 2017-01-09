"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getIndexBuilder = getIndexBuilder;

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _hoek = require("hoek");

var Hoek = _interopRequireWildcard(_hoek);

var _schemaS = require("./schema(s)");

var _validateSchema = require("./validateSchema");

var _validateSchema2 = _interopRequireDefault(_validateSchema);

var _throwWrappedError = require("./throwWrappedError");

var _throwWrappedError2 = _interopRequireDefault(_throwWrappedError);

var _mongoConnectionFactory = require("./services/mongo-connection-factory");

var _mongoService = require("./services/mongoService");

var _mongoService2 = _interopRequireDefault(_mongoService);

var _mongodb = require("mongodb");

var Mongodb = _interopRequireWildcard(_mongodb);

var _logger = require("./services/logger");

var _logger2 = _interopRequireDefault(_logger);

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

var _events = require("events");

var _customEvents = require("./customEvents");

var customEvents = _interopRequireWildcard(_customEvents);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var protectedInstance = void 0;
var defaultLoggerConfig = {
  "streams": [{
    "level": "trace",
    "stream": process.stdout
  }]
};
// let internals;
var map = new WeakMap();
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

var indexBuilderService = function () {
  function indexBuilderService(_ref) {
    var mongoConfig = _ref.mongoConfig,
        loggerConfig = _ref.loggerConfig,
        dataService = _ref.dataService,
        MockLogger = _ref.MockLogger,
        MockEventEmitter = _ref.MockEventEmitter;

    _classCallCheck(this, indexBuilderService);

    // internals = getPrivateHub(this);

    if (!MockLogger) {
      if (loggerConfig) {

        defaultLoggerConfig = _joi2.default.attempt(loggerConfig, _schemaS.loggerSchema, "Logger configuration is not in the required format");
      }
      getPrivateHub(this).loggerService = new _logger2.default(defaultLoggerConfig);
    } else {
      getPrivateHub(this).loggerService = MockLogger;
    }

    if (!dataService) {
      _joi2.default.assert(mongoConfig, _schemaS.mongoConfigSchema, "Mongo DB configuration is not in the required format");
      getPrivateHub(this).dataService = new _mongoService2.default({
        "mongoConnectionFactory": (0, _mongoConnectionFactory.getDbConnectionManager)({
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
      var _this = this;

      var promise = Promise.resolve(null);

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        var _loop = function _loop() {
          var index = _step.value;


          var indexKeys = {};
          var indexOptions = {};

          index.indexKeys.forEach(function (indexKey) {
            indexKeys[indexKey.keyName] = indexKey.keySortOrder;
          });
          if (index.indexName) {
            indexOptions.name = index.indexName;
          }

          if (index.indexOptions) {
            Object.assign(indexOptions, index.indexOptions);
          }
          _this.eventEmitter.emit(customEvents.indexEvents.indexCreate, "Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));

          promise = promise.then(function () {
            return getPrivateHub(_this).dataService.createIndex(index.collectionName, indexKeys, indexOptions);
          }).then(function () {
            return _this.eventEmitter.emit(customEvents.indexEvents.indexCreated, "Keys : " + Hoek.stringify(indexKeys) + ", Options : " + Hoek.stringify(indexOptions));
          });
        };

        for (var _iterator = createList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
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
      var _this2 = this;

      var promise = Promise.resolve(null);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        var _loop2 = function _loop2() {
          var index = _step2.value;


          if (index.indexName !== "_id_") {
            _this2.eventEmitter.emit(customEvents.indexEvents.indexDrop, index.indexName);
            promise = promise.then(function () {
              return getPrivateHub(_this2).dataService.dropIndex(index.collectionName, index.indexName);
            }).then(function () {
              return _this2.eventEmitter.emit(customEvents.indexEvents.indexDropped, index.indexName);
            });
          }
        };

        for (var _iterator2 = dropList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          _loop2();
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
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
      var formattedKeys = [];
      Object.keys(indexKeys).forEach(function (indexKey) {
        return formattedKeys.push({
          "keyName": indexKey,
          "keySortOrder": indexKeys[indexKey]
        });
      });

      return formattedKeys;
    };

    /**
     * Function to format index list
     * @param {Array<Objects>} indexList - Array of objects containing index information
     * @returns {Array.<Object>} - The result array containing formatted objects or Error
     * @private
     */
    getPrivateHub(this).formatResult = function (indexList) {
      var _this3 = this;

      var formattedResult = [];
      indexList.forEach(function (index) {
        formattedResult.push({
          "collectionName": index.ns.split(".")[1],
          "indexName": index.name,
          "indexKeys": getPrivateHub(_this3).extractKeys(index.key)
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

      var collectionList = Hoek.unique(indexList.map(function (index) {
        return index.collectionName;
      }));
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
      var _this4 = this;

      var collectionIndexListPromises = [];
      getPrivateHub(this).indexCreateList = indexList;
      getPrivateHub(this).getCollectionNames(indexList).forEach(function (collection) {
        collectionIndexListPromises.push(getPrivateHub(_this4).dataService.getIndexes(collection).then(function (result) {
          var indexPosition = void 0;
          getPrivateHub(_this4).formatResult(result).forEach(function (index) {
            if ((indexPosition = indexList.findIndex(function (indexToBeCreated) {
              return Hoek.deepEqual(indexToBeCreated, index, { "prototype": false });
            })) === -1) {
              getPrivateHub(_this4).indexDropList.push(index);
            } else {
              getPrivateHub(_this4).indexCreateList.splice(indexPosition, 1);
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
      var _this5 = this;

      Object.keys(eventsToRegister).forEach(function (eventName) {

        eventEmitter.on(eventName, function (info) {

          getPrivateHub(_this5).loggerService.info(eventsToRegister[eventName] + info);
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
      getPrivateHub(this).loggerService.error({ "error": error });
      throw error;
    }.bind(this);

    this.eventEmitter = MockEventEmitter || new _events.EventEmitter();
    getPrivateHub(this).registerEvents(this.eventEmitter, customEvents.indexEvents);
  }

  /**
   * Function to create indexes in a database
   * @param {Array<Objects>} indexList - Array of objects containing index information
   * @returns {Promise.<Any>} - The result object or Error
   * @public
   */


  _createClass(indexBuilderService, [{
    key: "buildIndexes",
    value: function buildIndexes(indexList) {
      var _this6 = this;

      try {
        this.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronisationStart, Hoek.stringify(new Date()));

        return (0, _validateSchema2.default)(indexList, _schemaS.indexListSchema, "Schema validation failed").then(function (validatedIndexList) {
          return _q2.default.all(getPrivateHub(_this6).getIndexSyncPromises(validatedIndexList));
        }).then(function () {
          return getPrivateHub(_this6).dropIndexes(getPrivateHub(_this6).indexDropList);
        }).then(function () {
          return getPrivateHub(_this6).createIndexes(getPrivateHub(_this6).indexCreateList);
        }).then(function () {
          return _this6.eventEmitter.emit(customEvents.indexEvents.IndexesSyncronised, Hoek.stringify(new Date()));
        }).catch(function (error) {

          _this6.eventEmitter.emit(customEvents.indexEvents.Error, error.message);
          return getPrivateHub(_this6).errorHandler((0, _throwWrappedError2.default)("Error in building indexes : " + error.message, error));
        });
      } catch (error) {

        return Promise.reject(error);
      }
    }
  }]);

  return indexBuilderService;
}();

/**
 * Returns mongo index builder singleton
 * @param {Object} mongoConfig - Mongo db congif values
 * @param {Object} loggerConfig - Logger configurations
 * @returns {indexBuilderService}  The index builder singleton instance
 */


exports.default = indexBuilderService;
function getIndexBuilder(_ref2) {
  var mongoConfig = _ref2.mongoConfig,
      loggerConfig = _ref2.loggerConfig,
      dataService = _ref2.dataService,
      MockLogger = _ref2.MockLogger;


  protectedInstance = protectedInstance || new indexBuilderService({ mongoConfig: mongoConfig, loggerConfig: loggerConfig, dataService: dataService, MockLogger: MockLogger });
  return protectedInstance;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9pbmRleEJ1aWxkZXIuZXM2Il0sIm5hbWVzIjpbImdldEluZGV4QnVpbGRlciIsIkhvZWsiLCJNb25nb2RiIiwiY3VzdG9tRXZlbnRzIiwicHJvdGVjdGVkSW5zdGFuY2UiLCJkZWZhdWx0TG9nZ2VyQ29uZmlnIiwicHJvY2VzcyIsInN0ZG91dCIsIm1hcCIsIldlYWtNYXAiLCJnZXRQcml2YXRlSHViIiwib2JqZWN0IiwiaGFzIiwic2V0IiwiZ2V0IiwiaW5kZXhCdWlsZGVyU2VydmljZSIsIm1vbmdvQ29uZmlnIiwibG9nZ2VyQ29uZmlnIiwiZGF0YVNlcnZpY2UiLCJNb2NrTG9nZ2VyIiwiTW9ja0V2ZW50RW1pdHRlciIsImF0dGVtcHQiLCJsb2dnZXJTZXJ2aWNlIiwiYXNzZXJ0IiwiY29ubmVjdGlvblN0cmluZyIsIm9wZXJhdGlvblRpbWVvdXQiLCJpbmRleERyb3BMaXN0IiwiaW5kZXhDcmVhdGVMaXN0IiwiY3JlYXRlSW5kZXhlcyIsImNyZWF0ZUxpc3QiLCJwcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpbmRleCIsImluZGV4S2V5cyIsImluZGV4T3B0aW9ucyIsImZvckVhY2giLCJpbmRleEtleSIsImtleU5hbWUiLCJrZXlTb3J0T3JkZXIiLCJpbmRleE5hbWUiLCJuYW1lIiwiT2JqZWN0IiwiYXNzaWduIiwiZXZlbnRFbWl0dGVyIiwiZW1pdCIsImluZGV4RXZlbnRzIiwiaW5kZXhDcmVhdGUiLCJzdHJpbmdpZnkiLCJ0aGVuIiwiY3JlYXRlSW5kZXgiLCJjb2xsZWN0aW9uTmFtZSIsImluZGV4Q3JlYXRlZCIsImJpbmQiLCJkcm9wSW5kZXhlcyIsImRyb3BMaXN0IiwiaW5kZXhEcm9wIiwiZHJvcEluZGV4IiwiaW5kZXhEcm9wcGVkIiwiZXh0cmFjdEtleXMiLCJmb3JtYXR0ZWRLZXlzIiwia2V5cyIsInB1c2giLCJmb3JtYXRSZXN1bHQiLCJpbmRleExpc3QiLCJmb3JtYXR0ZWRSZXN1bHQiLCJucyIsInNwbGl0Iiwia2V5IiwiZ2V0Q29sbGVjdGlvbk5hbWVzIiwiY29sbGVjdGlvbkxpc3QiLCJ1bmlxdWUiLCJjb2xsZWN0aW9uTmFtZXMiLCJqb2luIiwiZ2V0SW5kZXhTeW5jUHJvbWlzZXMiLCJjb2xsZWN0aW9uSW5kZXhMaXN0UHJvbWlzZXMiLCJnZXRJbmRleGVzIiwiY29sbGVjdGlvbiIsImluZGV4UG9zaXRpb24iLCJyZXN1bHQiLCJmaW5kSW5kZXgiLCJkZWVwRXF1YWwiLCJpbmRleFRvQmVDcmVhdGVkIiwic3BsaWNlIiwicmVnaXN0ZXJFdmVudHMiLCJldmVudHNUb1JlZ2lzdGVyIiwib24iLCJldmVudE5hbWUiLCJpbmZvIiwiZXJyb3JIYW5kbGVyIiwiZXJyb3IiLCJJbmRleGVzU3luY3JvbmlzYXRpb25TdGFydCIsIkRhdGUiLCJhbGwiLCJ2YWxpZGF0ZWRJbmRleExpc3QiLCJJbmRleGVzU3luY3JvbmlzZWQiLCJjYXRjaCIsIkVycm9yIiwibWVzc2FnZSIsInJlamVjdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7UUFpUmdCQSxlLEdBQUFBLGU7O0FBalJoQjs7OztBQUNBOztJQUFZQyxJOztBQUNaOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7OztBQUNBOztJQUFZQyxPOztBQUNaOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7SUFBWUMsWTs7Ozs7Ozs7QUFFWixJQUFJQywwQkFBSjtBQUNBLElBQUlDLHNCQUFzQjtBQUN4QixhQUFXLENBQUM7QUFDVixhQUFTLE9BREM7QUFFVixjQUFVQyxRQUFRQztBQUZSLEdBQUQ7QUFEYSxDQUExQjtBQU1BO0FBQ0EsSUFBTUMsTUFBTSxJQUFJQyxPQUFKLEVBQVo7QUFDQSxTQUFTQyxhQUFULENBQXVCQyxNQUF2QixFQUErQjs7QUFFN0IsTUFBSSxDQUFDSCxJQUFJSSxHQUFKLENBQVFELE1BQVIsQ0FBTCxFQUFzQjtBQUNwQkgsUUFBSUssR0FBSixDQUFRRixNQUFSLEVBQWdCLEVBQWhCO0FBQ0Q7QUFDRCxTQUFPSCxJQUFJTSxHQUFKLENBQVFILE1BQVIs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Q0Msc0JBQXpDLEVBQXhCLENBQXpDO0FBQ0EsU0FBT2YsaUJBQVA7QUFDRCIsImZpbGUiOiJpbmRleEJ1aWxkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUSBmcm9tIFwicVwiO1xuaW1wb3J0ICogYXMgSG9layBmcm9tIFwiaG9la1wiO1xuaW1wb3J0IHtpbmRleExpc3RTY2hlbWEsIGxvZ2dlclNjaGVtYSwgbW9uZ29Db25maWdTY2hlbWF9IGZyb20gXCIuL3NjaGVtYShzKVwiO1xuaW1wb3J0IFZhbGlkYXRlU2NoZW1hIGZyb20gXCIuL3ZhbGlkYXRlU2NoZW1hXCI7XG5pbXBvcnQgVGhyb3dXcmFwcGVkRXJyb3IgZnJvbSBcIi4vdGhyb3dXcmFwcGVkRXJyb3JcIjtcbmltcG9ydCB7Z2V0RGJDb25uZWN0aW9uTWFuYWdlcn0gZnJvbSBcIi4vc2VydmljZXMvbW9uZ28tY29ubmVjdGlvbi1mYWN0b3J5XCI7XG5pbXBvcnQgTW9uZ29kYkNsaWVudCBmcm9tIFwiLi9zZXJ2aWNlcy9tb25nb1NlcnZpY2VcIjtcbmltcG9ydCAqIGFzIE1vbmdvZGIgZnJvbSBcIm1vbmdvZGJcIjtcbmltcG9ydCBMb2dnZXIgZnJvbSBcIi4vc2VydmljZXMvbG9nZ2VyXCI7XG5pbXBvcnQgSm9pIGZyb20gXCJqb2lcIjtcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tIFwiZXZlbnRzXCI7XG5pbXBvcnQgKiBhcyBjdXN0b21FdmVudHMgZnJvbSBcIi4vY3VzdG9tRXZlbnRzXCI7XG5cbmxldCBwcm90ZWN0ZWRJbnN0YW5jZTtcbmxldCBkZWZhdWx0TG9nZ2VyQ29uZmlnID0ge1xuICBcInN0cmVhbXNcIjogW3tcbiAgICBcImxldmVsXCI6IFwidHJhY2VcIixcbiAgICBcInN0cmVhbVwiOiBwcm9jZXNzLnN0ZG91dFxuICB9XVxufTtcbi8vIGxldCBpbnRlcm5hbHM7XG5jb25zdCBtYXAgPSBuZXcgV2Vha01hcCgpO1xuZnVuY3Rpb24gZ2V0UHJpdmF0ZUh1YihvYmplY3QpIHtcblxuICBpZiAoIW1hcC5oYXMob2JqZWN0KSkge1xuICAgIG1hcC5zZXQob2JqZWN0LCB7fSk7XG4gIH1cbiAgcmV0dXJuIG1hcC5nZXQob2JqZWN0KTtcbn1cblxuLyoqXG4gKiBTZXJ2aWNlcyBmb3IgYnVpbGRpbmcgaW5kZXhlcyBpbiBkYXRhYmFzZVxuICogQGNsYXNzIGluZGV4QnVpbGRlclNlcnZpY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBtb25nb0NvbmZpZyAtIE1vbmdvIGRiIGNvbmdpZiB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnZXJDb25maWcgLSBMb2dnZXIgY29uZmlndXJhdGlvbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgaW5kZXhCdWlsZGVyU2VydmljZSB7XG5cbiAgY29uc3RydWN0b3Ioe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyLCBNb2NrRXZlbnRFbWl0dGVyfSkge1xuXG4gICAvLyBpbnRlcm5hbHMgPSBnZXRQcml2YXRlSHViKHRoaXMpO1xuXG4gICAgaWYgKCFNb2NrTG9nZ2VyKSB7XG4gICAgICBpZiAobG9nZ2VyQ29uZmlnKSB7XG5cbiAgICAgICAgZGVmYXVsdExvZ2dlckNvbmZpZyA9IEpvaS5hdHRlbXB0KGxvZ2dlckNvbmZpZywgbG9nZ2VyU2NoZW1hLCBcIkxvZ2dlciBjb25maWd1cmF0aW9uIGlzIG5vdCBpbiB0aGUgcmVxdWlyZWQgZm9ybWF0XCIpO1xuICAgICAgfVxuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlID0gbmV3IExvZ2dlcihkZWZhdWx0TG9nZ2VyQ29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlID0gTW9ja0xvZ2dlcjtcbiAgICB9XG5cbiAgICBpZiAoIWRhdGFTZXJ2aWNlKSB7XG4gICAgICBKb2kuYXNzZXJ0KG1vbmdvQ29uZmlnLCBtb25nb0NvbmZpZ1NjaGVtYSwgXCJNb25nbyBEQiBjb25maWd1cmF0aW9uIGlzIG5vdCBpbiB0aGUgcmVxdWlyZWQgZm9ybWF0XCIpO1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZSA9IG5ldyBNb25nb2RiQ2xpZW50KHtcbiAgICAgICAgXCJtb25nb0Nvbm5lY3Rpb25GYWN0b3J5XCI6IGdldERiQ29ubmVjdGlvbk1hbmFnZXIoe1xuICAgICAgICAgIFwibG9nZ2VyXCI6IGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZSxcbiAgICAgICAgICBcIm5hdGl2ZURyaXZlclwiOiBNb25nb2RiLFxuICAgICAgICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBtb25nb0NvbmZpZy5jb25uZWN0aW9uU3RyaW5nLFxuICAgICAgICAgIFwiaW9UaW1lb3V0XCI6IG1vbmdvQ29uZmlnLm9wZXJhdGlvblRpbWVvdXQgfHwgNTAwMFxuICAgICAgICB9KSxcbiAgICAgICAgXCJsb2dnZXJTZXJ2aWNlXCI6IGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UgPSBkYXRhU2VydmljZTtcbiAgICB9XG5cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QgPSBbXTtcbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4Q3JlYXRlTGlzdCA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gY3JlYXRlIGluZGV4ZXMgaW4gYSBjb2xsZWN0aW9uXG4gICAgICogQHBhcmFtIHtBcnJheTxPYmplY3RzPn0gY3JlYXRlTGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtQcm9taXNlLjxBbnk+fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmNyZWF0ZUluZGV4ZXMgPSBmdW5jdGlvbiAoY3JlYXRlTGlzdCkge1xuXG4gICAgICBsZXQgcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShudWxsKTtcblxuXG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGNyZWF0ZUxpc3QpIHtcblxuICAgICAgICBjb25zdCBpbmRleEtleXMgPSB7fTtcbiAgICAgICAgY29uc3QgaW5kZXhPcHRpb25zID0ge307XG5cbiAgICAgICAgaW5kZXguaW5kZXhLZXlzLmZvckVhY2goaW5kZXhLZXkgPT4ge1xuICAgICAgICAgIGluZGV4S2V5c1tpbmRleEtleS5rZXlOYW1lXSA9IGluZGV4S2V5LmtleVNvcnRPcmRlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbmRleC5pbmRleE5hbWUpIHtcbiAgICAgICAgICBpbmRleE9wdGlvbnMubmFtZSA9IGluZGV4LmluZGV4TmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbmRleC5pbmRleE9wdGlvbnMpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKGluZGV4T3B0aW9ucywgaW5kZXguaW5kZXhPcHRpb25zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cy5pbmRleENyZWF0ZSwgYEtleXMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4S2V5cyl9LCBPcHRpb25zIDogJHtIb2VrLnN0cmluZ2lmeShpbmRleE9wdGlvbnMpfWApO1xuXG4gICAgICAgIHByb21pc2UgPSBwcm9taXNlXG4gICAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kYXRhU2VydmljZS5jcmVhdGVJbmRleChpbmRleC5jb2xsZWN0aW9uTmFtZSwgaW5kZXhLZXlzLCBpbmRleE9wdGlvbnMpKVxuICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLmluZGV4Q3JlYXRlZCwgYEtleXMgOiAke0hvZWsuc3RyaW5naWZ5KGluZGV4S2V5cyl9LCBPcHRpb25zIDogJHtIb2VrLnN0cmluZ2lmeShpbmRleE9wdGlvbnMpfWApKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZHJvcCBpbmRleGVzIGluIGEgY29sbGVjdGlvblxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGRyb3BMaXN0IC0gQXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGluZGV4IGluZm9ybWF0aW9uXG4gICAgICogQHJldHVybnMge1Byb21pc2UuPEFueT59IC0gVGhlIHJlc3VsdCBvYmplY3Qgb3IgRXJyb3JcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZHJvcEluZGV4ZXMgPSBmdW5jdGlvbiAoZHJvcExpc3QpIHtcbiAgICAgIGxldCBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXG4gICAgICBmb3IgKGNvbnN0IGluZGV4IG9mIGRyb3BMaXN0KSB7XG5cbiAgICAgICAgaWYgKGluZGV4LmluZGV4TmFtZSAhPT0gXCJfaWRfXCIpIHtcbiAgICAgICAgICB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cy5pbmRleERyb3AsIGluZGV4LmluZGV4TmFtZSk7XG4gICAgICAgICAgcHJvbWlzZSA9IHByb21pc2VcbiAgICAgICAgICAgIC50aGVuKCgpID0+IGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UuZHJvcEluZGV4KGluZGV4LmNvbGxlY3Rpb25OYW1lLCBpbmRleC5pbmRleE5hbWUpKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuaW5kZXhEcm9wcGVkLCBpbmRleC5pbmRleE5hbWUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZXh0cmFjdCBhbmQgZm9ybWF0IGluZGV4IGtleXMgaW4gZGVzaXJlZCBmb3JtYXRcbiAgICAgKiBAcGFyYW0ge29iamVjdHN9IGluZGV4S2V5cyAtIE9iamVjdCBjb250YWluaW5nIGtleXMgb2YgYW4gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSAtIFRoZSByZXN1bHQgb2JqZWN0IG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmV4dHJhY3RLZXlzID0gZnVuY3Rpb24gKGluZGV4S2V5cykge1xuICAgICAgY29uc3QgZm9ybWF0dGVkS2V5cyA9IFtdO1xuICAgICAgT2JqZWN0LmtleXMoaW5kZXhLZXlzKS5mb3JFYWNoKGluZGV4S2V5ID0+IGZvcm1hdHRlZEtleXMucHVzaCh7XG4gICAgICAgIFwia2V5TmFtZVwiOiBpbmRleEtleSxcbiAgICAgICAgXCJrZXlTb3J0T3JkZXJcIjogaW5kZXhLZXlzW2luZGV4S2V5XVxuICAgICAgfSkpO1xuXG4gICAgICByZXR1cm4gZm9ybWF0dGVkS2V5cztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRnVuY3Rpb24gdG8gZm9ybWF0IGluZGV4IGxpc3RcbiAgICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHM+fSBpbmRleExpc3QgLSBBcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgaW5kZXggaW5mb3JtYXRpb25cbiAgICAgKiBAcmV0dXJucyB7QXJyYXkuPE9iamVjdD59IC0gVGhlIHJlc3VsdCBhcnJheSBjb250YWluaW5nIGZvcm1hdHRlZCBvYmplY3RzIG9yIEVycm9yXG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmZvcm1hdFJlc3VsdCA9IGZ1bmN0aW9uIChpbmRleExpc3QpIHtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZFJlc3VsdCA9IFtdO1xuICAgICAgaW5kZXhMaXN0LmZvckVhY2goaW5kZXggPT4ge1xuICAgICAgICBmb3JtYXR0ZWRSZXN1bHQucHVzaCh7XG4gICAgICAgICAgXCJjb2xsZWN0aW9uTmFtZVwiOiBpbmRleC5ucy5zcGxpdChcIi5cIilbMV0sXG4gICAgICAgICAgXCJpbmRleE5hbWVcIjogaW5kZXgubmFtZSxcbiAgICAgICAgICBcImluZGV4S2V5c1wiOiBnZXRQcml2YXRlSHViKHRoaXMpLmV4dHJhY3RLZXlzKGluZGV4LmtleSlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGZvcm1hdHRlZFJlc3VsdDtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byBnZXQgY29sbGVjdGlvbiBuYW1lcyBvdXQgb2YgaW5kZXggbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtBcnJheS48U3RyaW5nPn0gLSBUaGUgcmVzdWx0IGFycmF5IGNvbnRhaW5pbmcgdW5pcXVlIGNvbGxlY3Rpb24gbmFtZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZ2V0Q29sbGVjdGlvbk5hbWVzID0gZnVuY3Rpb24gKGluZGV4TGlzdCkge1xuXG4gICAgICBjb25zdCBjb2xsZWN0aW9uTGlzdCA9IEhvZWsudW5pcXVlKGluZGV4TGlzdC5tYXAoaW5kZXggPT4gaW5kZXguY29sbGVjdGlvbk5hbWUpKTtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLmNvbGxlY3Rpb25OYW1lcywgY29sbGVjdGlvbkxpc3Quam9pbigpKTtcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25MaXN0O1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGdldCBpbmRleCBzeW5jIHByb21pc2VzIGZvciB0aGUgcHJvdmlkZWQgaW5kZXggbGlzdFxuICAgICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgICAqIEByZXR1cm5zIHtBcnJheS48UHJvbWlzZT59IC0gVGhlIHJlc3VsdCBhcnJheSBjb250YWluaW5nIHN5bmMgcHJvbWlzZXNcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykuZ2V0SW5kZXhTeW5jUHJvbWlzZXMgPSBmdW5jdGlvbiAoaW5kZXhMaXN0KSB7XG5cbiAgICAgIGNvbnN0IGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcyA9IFtdO1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3QgPSBpbmRleExpc3Q7XG4gICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmdldENvbGxlY3Rpb25OYW1lcyhpbmRleExpc3QpLmZvckVhY2goY29sbGVjdGlvbiA9PiB7XG4gICAgICAgIGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcy5wdXNoKGdldFByaXZhdGVIdWIodGhpcykuZGF0YVNlcnZpY2UuZ2V0SW5kZXhlcyhjb2xsZWN0aW9uKVxuICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBsZXQgaW5kZXhQb3NpdGlvbjtcbiAgICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykuZm9ybWF0UmVzdWx0KHJlc3VsdCkuZm9yRWFjaChpbmRleCA9PiB7XG4gICAgICAgICAgICAgIGlmICgoaW5kZXhQb3NpdGlvbiA9IGluZGV4TGlzdC5maW5kSW5kZXgoaW5kZXhUb0JlQ3JlYXRlZCA9PiBIb2VrLmRlZXBFcXVhbChpbmRleFRvQmVDcmVhdGVkLCBpbmRleCwge1wicHJvdG90eXBlXCI6IGZhbHNlfSkpKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QucHVzaChpbmRleCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3Quc3BsaWNlKGluZGV4UG9zaXRpb24sIDEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGNvbGxlY3Rpb25JbmRleExpc3RQcm9taXNlcztcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAvKipcbiAgICAgKiBGdW5jdGlvbiB0byByZWdpc3RlciBoYW5kbGVycyBmb3IgaW5kZXggYnVpbGRpbmcgcHJvY2Vzc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudEVtaXR0ZXIgLSBFdmVudCBFbWl0dGVyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50c1RvUmVnaXN0ZXIgLSBPYmplY3QgY29udGFpbmluZyBldmVudHMgdG8gcmVnaXN0ZXIgYWxvbmcgd2l0aCB0aGVpciBtZXNzYWdlc1xuICAgICAqIEByZXR1cm5zIHtWb2lkfSAtIHJldHVybnMgdm9pZC5cbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIGdldFByaXZhdGVIdWIodGhpcykucmVnaXN0ZXJFdmVudHMgPSBmdW5jdGlvbiAoZXZlbnRFbWl0dGVyLCBldmVudHNUb1JlZ2lzdGVyKSB7XG5cbiAgICAgIE9iamVjdC5rZXlzKGV2ZW50c1RvUmVnaXN0ZXIpLmZvckVhY2goZXZlbnROYW1lID0+IHtcblxuICAgICAgICBldmVudEVtaXR0ZXIub24oZXZlbnROYW1lLCBpbmZvID0+IHtcblxuICAgICAgICAgIGdldFByaXZhdGVIdWIodGhpcykubG9nZ2VyU2VydmljZS5pbmZvKGV2ZW50c1RvUmVnaXN0ZXJbZXZlbnROYW1lXSArIGluZm8pO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0uYmluZCh0aGlzKTtcblxuICAgIC8qKlxuICAgICAqIEZ1bmN0aW9uIHRvIGhhbmRsZSBlcnJvci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yICBlcnJvciBvYmplY3QuXG4gICAgICogQHJldHVybnMge3ZvaWR9XG4gICAgICogQHByaXZhdGVcbiAgICAgKi9cbiAgICBnZXRQcml2YXRlSHViKHRoaXMpLmVycm9ySGFuZGxlciA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgZ2V0UHJpdmF0ZUh1Yih0aGlzKS5sb2dnZXJTZXJ2aWNlLmVycm9yKHtcImVycm9yXCI6IGVycm9yfSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9LmJpbmQodGhpcyk7XG5cbiAgICB0aGlzLmV2ZW50RW1pdHRlciA9IE1vY2tFdmVudEVtaXR0ZXIgfHwgbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIGdldFByaXZhdGVIdWIodGhpcykucmVnaXN0ZXJFdmVudHModGhpcy5ldmVudEVtaXR0ZXIsIGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cyk7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBGdW5jdGlvbiB0byBjcmVhdGUgaW5kZXhlcyBpbiBhIGRhdGFiYXNlXG4gICAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0cz59IGluZGV4TGlzdCAtIEFycmF5IG9mIG9iamVjdHMgY29udGFpbmluZyBpbmRleCBpbmZvcm1hdGlvblxuICAgKiBAcmV0dXJucyB7UHJvbWlzZS48QW55Pn0gLSBUaGUgcmVzdWx0IG9iamVjdCBvciBFcnJvclxuICAgKiBAcHVibGljXG4gICAqL1xuICBidWlsZEluZGV4ZXMoaW5kZXhMaXN0KSB7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXIuZW1pdChjdXN0b21FdmVudHMuaW5kZXhFdmVudHMuSW5kZXhlc1N5bmNyb25pc2F0aW9uU3RhcnQsIEhvZWsuc3RyaW5naWZ5KG5ldyBEYXRlKCkpKTtcblxuICAgICAgcmV0dXJuIFZhbGlkYXRlU2NoZW1hKGluZGV4TGlzdCwgaW5kZXhMaXN0U2NoZW1hLCBcIlNjaGVtYSB2YWxpZGF0aW9uIGZhaWxlZFwiKVxuICAgICAgICAudGhlbih2YWxpZGF0ZWRJbmRleExpc3QgPT4gUS5hbGwoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5nZXRJbmRleFN5bmNQcm9taXNlcyh2YWxpZGF0ZWRJbmRleExpc3QpKSlcbiAgICAgICAgLnRoZW4oKCkgPT4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5kcm9wSW5kZXhlcyhnZXRQcml2YXRlSHViKHRoaXMpLmluZGV4RHJvcExpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiBnZXRQcml2YXRlSHViKHRoaXMpLmNyZWF0ZUluZGV4ZXMoZ2V0UHJpdmF0ZUh1Yih0aGlzKS5pbmRleENyZWF0ZUxpc3QpKVxuICAgICAgICAudGhlbigoKSA9PiB0aGlzLmV2ZW50RW1pdHRlci5lbWl0KGN1c3RvbUV2ZW50cy5pbmRleEV2ZW50cy5JbmRleGVzU3luY3JvbmlzZWQsIEhvZWsuc3RyaW5naWZ5KG5ldyBEYXRlKCkpKSlcbiAgICAgICAgLmNhdGNoKGVycm9yID0+IHtcblxuICAgICAgICAgIHRoaXMuZXZlbnRFbWl0dGVyLmVtaXQoY3VzdG9tRXZlbnRzLmluZGV4RXZlbnRzLkVycm9yLCBlcnJvci5tZXNzYWdlKTtcbiAgICAgICAgICByZXR1cm4gZ2V0UHJpdmF0ZUh1Yih0aGlzKS5lcnJvckhhbmRsZXIoVGhyb3dXcmFwcGVkRXJyb3IoYEVycm9yIGluIGJ1aWxkaW5nIGluZGV4ZXMgOiAke2Vycm9yLm1lc3NhZ2V9YCwgZXJyb3IpKTtcbiAgICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICB9XG4gIH1cbn1cblxuXG4vKipcbiAqIFJldHVybnMgbW9uZ28gaW5kZXggYnVpbGRlciBzaW5nbGV0b25cbiAqIEBwYXJhbSB7T2JqZWN0fSBtb25nb0NvbmZpZyAtIE1vbmdvIGRiIGNvbmdpZiB2YWx1ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBsb2dnZXJDb25maWcgLSBMb2dnZXIgY29uZmlndXJhdGlvbnNcbiAqIEByZXR1cm5zIHtpbmRleEJ1aWxkZXJTZXJ2aWNlfSAgVGhlIGluZGV4IGJ1aWxkZXIgc2luZ2xldG9uIGluc3RhbmNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbmRleEJ1aWxkZXIoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSkge1xuXG4gIHByb3RlY3RlZEluc3RhbmNlID0gcHJvdGVjdGVkSW5zdGFuY2UgfHwgbmV3IGluZGV4QnVpbGRlclNlcnZpY2Uoe21vbmdvQ29uZmlnLCBsb2dnZXJDb25maWcsIGRhdGFTZXJ2aWNlLCBNb2NrTG9nZ2VyfSk7XG4gIHJldHVybiBwcm90ZWN0ZWRJbnN0YW5jZTtcbn1cblxuIl19
//# sourceMappingURL=indexBuilder.js.map
