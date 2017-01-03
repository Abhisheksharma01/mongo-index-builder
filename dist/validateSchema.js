"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateSchema;

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

var _hoek = require("hoek");

var _hoek2 = _interopRequireDefault(_hoek);

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

var _throwWrappedError = require("./throwWrappedError");

var _throwWrappedError2 = _interopRequireDefault(_throwWrappedError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
// Imports

function validateSchema(value, schema, errorMessagePrefix, joiOptions) {

  var defaultJoiOptions = {
    "convert": true,
    "stripUnknown": true
  };

  if (typeof value === "undefined") {
    return Promise.reject(new Error(errorMessagePrefix + ": undefined"));
  }

  var joiOptions_ = _hoek2.default.applyToDefaults(defaultJoiOptions, joiOptions || {});

  return _q2.default.nfcall(_joi2.default.validate, value, schema, joiOptions_).catch(function (err) {
    return (0, _throwWrappedError2.default)(errorMessagePrefix + ": " + err.message, err);
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi92YWxpZGF0ZVNjaGVtYS5lczYiXSwibmFtZXMiOlsidmFsaWRhdGVTY2hlbWEiLCJ2YWx1ZSIsInNjaGVtYSIsImVycm9yTWVzc2FnZVByZWZpeCIsImpvaU9wdGlvbnMiLCJkZWZhdWx0Sm9pT3B0aW9ucyIsIlByb21pc2UiLCJyZWplY3QiLCJFcnJvciIsImpvaU9wdGlvbnNfIiwiYXBwbHlUb0RlZmF1bHRzIiwibmZjYWxsIiwidmFsaWRhdGUiLCJjYXRjaCIsImVyciIsIm1lc3NhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7O2tCQXFCd0JBLGM7O0FBbkJ4Qjs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBR0E7Ozs7Ozs7Ozs7Ozs7QUFSQTs7QUFxQmUsU0FBU0EsY0FBVCxDQUF3QkMsS0FBeEIsRUFBK0JDLE1BQS9CLEVBQXVDQyxrQkFBdkMsRUFBMkRDLFVBQTNELEVBQXVFOztBQUVwRixNQUFNQyxvQkFBb0I7QUFDeEIsZUFBVyxJQURhO0FBRXhCLG9CQUFnQjtBQUZRLEdBQTFCOztBQUtBLE1BQUksT0FBT0osS0FBUCxLQUFpQixXQUFyQixFQUFrQztBQUNoQyxXQUFPSyxRQUFRQyxNQUFSLENBQWUsSUFBSUMsS0FBSixDQUFhTCxrQkFBYixpQkFBZixDQUFQO0FBQ0Q7O0FBRUQsTUFBTU0sY0FBYyxlQUFLQyxlQUFMLENBQXFCTCxpQkFBckIsRUFBd0NELGNBQWMsRUFBdEQsQ0FBcEI7O0FBRUEsU0FBTyxZQUFFTyxNQUFGLENBQVMsY0FBSUMsUUFBYixFQUF1QlgsS0FBdkIsRUFBOEJDLE1BQTlCLEVBQXNDTyxXQUF0QyxFQUNKSSxLQURJLENBQ0U7QUFBQSxXQUFPLGlDQUFxQlYsa0JBQXJCLFVBQTRDVyxJQUFJQyxPQUFoRCxFQUEyREQsR0FBM0QsQ0FBUDtBQUFBLEdBREYsQ0FBUDtBQUVEIiwiZmlsZSI6InZhbGlkYXRlU2NoZW1hLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gSW1wb3J0c1xuXG5pbXBvcnQgSm9pIGZyb20gXCJqb2lcIjtcbmltcG9ydCBIb2VrIGZyb20gXCJob2VrXCI7XG5pbXBvcnQgUSBmcm9tIFwicVwiO1xuaW1wb3J0IFRocm93V3JhcHBlZEVycm9yIGZyb20gXCIuL3Rocm93V3JhcHBlZEVycm9yXCI7XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0byB2YWxpZGF0ZXMgYSBKb2kgc2NoZW1hLiBXaWxsIGV2ZW50eWFsbHkgcmVzb2x2ZSB0byB0aGVcbiAqIHJldHVybmVkIHZhbGlkYXRlIEpvaSB2YWx1ZSBPUiByZWplY3QgaWYgdGhlIHZhbHVlIGRvZXMgbm90IHZhbGlkYXRlLlxuICpcbiAqIEBwYXJhbSAge0FueX0gdmFsdWUgLSBWYWx1ZSB0byB2YWxpZGF0ZWRcbiAqIEBwYXJhbSAge0pvaVNjaGVtYX0gc2NoZW1hIC0gVGhlIEpvaSBzY2hlbWEgdG8gYmUgdXNlZCBmb3IgdmFsaWRhdGlvblxuICogQHBhcmFtICB7W3R5cGVdfSBlcnJvck1lc3NhZ2VQcmVmaXggLSBBIHByZWZpeCBmb3IgdGhlIGVycm9yIG1lc3NhZ2UgdGhhdFxuICogaXQgd2lsbCByZXR1cm4gaWYgaXQgZG9lcyBub3QgdmFsaWRhdGUuXG4gKiBAcGFyYW0gIHtBbnl9IGpvaU9wdGlvbnMgLSBBbnkgdmFsaWQgSm9pIG9wdGlvbnMuIERlZmF1bHRzIHRvXG4gKiBgeyBcInN0cmlwVW5rbm93blwiOiB0cnVlLCBcImNvbnZlcnRcIjogdHJ1ZSB9YFxuICogQHJldHVybiB7UHJvbWlzZS48QW55Pn0gLSBFdmVudHVhbGx5IHJlc29sdmVzIHRvIHRoZSB2YWxpZGF0ZWQvY29udmVydGVkXG4gKiB2YWx1ZSBvciB3aWxsIHJlamVjdCB3aXRoIGFuIGVycm9yIGlmIGl0IGRvZXNuJ3QgdmFsaWRhdGVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdmFsaWRhdGVTY2hlbWEodmFsdWUsIHNjaGVtYSwgZXJyb3JNZXNzYWdlUHJlZml4LCBqb2lPcHRpb25zKSB7XG5cbiAgY29uc3QgZGVmYXVsdEpvaU9wdGlvbnMgPSB7XG4gICAgXCJjb252ZXJ0XCI6IHRydWUsXG4gICAgXCJzdHJpcFVua25vd25cIjogdHJ1ZVxuICB9O1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGAke2Vycm9yTWVzc2FnZVByZWZpeH06IHVuZGVmaW5lZGApKTtcbiAgfVxuXG4gIGNvbnN0IGpvaU9wdGlvbnNfID0gSG9lay5hcHBseVRvRGVmYXVsdHMoZGVmYXVsdEpvaU9wdGlvbnMsIGpvaU9wdGlvbnMgfHwge30pO1xuXG4gIHJldHVybiBRLm5mY2FsbChKb2kudmFsaWRhdGUsIHZhbHVlLCBzY2hlbWEsIGpvaU9wdGlvbnNfKVxuICAgIC5jYXRjaChlcnIgPT4gVGhyb3dXcmFwcGVkRXJyb3IoYCR7ZXJyb3JNZXNzYWdlUHJlZml4fTogJHtlcnIubWVzc2FnZX1gLCBlcnIpKTtcbn1cbiJdfQ==
//# sourceMappingURL=validateSchema.js.map
