import bunyan from "bunyan";
import {loggerSchema} from "./../schema(s)";
import Joi from "joi";


/**
 * Represents an eg logger
 * @class
 */
export default class Logger {

  /**
   * @constructor
   * @param {Object} configuration The configurations
   */
  constructor(configuration) {

    Joi.assert(configuration, loggerSchema, "configuration argument in correct format is required");

    /** @member {Bunyan.Logger} The bunyan logger instance */
    this.logger_ = bunyan.createLogger(configuration);
  }

  /**
   * Produces a fatal level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  fatal(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.fatal(...args);
  }

  /**
   * Produces a error level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  error(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.error(...args);
  }

  /**
   * Produces a warn level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  warn(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.warn(...args);
  }

  /**
   * Produces a info level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  info(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.info(...args);
  }

  /**
   * Produces a debug level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  debug(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.debug(...args);
  }

  /**
   * Produces a trace level log
   * @param {string|object} message The message to be logged
   * @param {object} data The relevant data to be logged
   * @returns {undefined} undefined
   * @public
   */
  trace(message, data) {

    const args = data ? [data, message] : [message];

    this.logger_.trace(...args);
  }
}
