// Imports

import Joi from "joi";
import Hoek from "hoek";
import Q from "q";
import ThrowWrappedError from "./throwWrappedError";


/**
 * Returns a promise to validates a Joi schema. Will eventyally resolve to the
 * returned validate Joi value OR reject if the value does not validate.
 *
 * @param  {Any} value - Value to validated
 * @param  {JoiSchema} schema - The Joi schema to be used for validation
 * @param  {[type]} errorMessagePrefix - A prefix for the error message that
 * it will return if it does not validate.
 * @param  {Any} joiOptions - Any valid Joi options. Defaults to
 * `{ "stripUnknown": true, "convert": true }`
 * @return {Promise.<Any>} - Eventually resolves to the validated/converted
 * value or will reject with an error if it doesn't validate
 */
export default function validateSchema(value, schema, errorMessagePrefix, joiOptions) {

  const defaultJoiOptions = {
    "convert": true,
    "stripUnknown": true
  };

  if (typeof value === "undefined") {
    return Promise.reject(new Error(`${errorMessagePrefix}: undefined`));
  }

  const joiOptions_ = Hoek.applyToDefaults(defaultJoiOptions, joiOptions || {});

  return Q.nfcall(Joi.validate, value, schema, joiOptions_)
    .catch(err => ThrowWrappedError(`${errorMessagePrefix}: ${err.message}`, err));
}
