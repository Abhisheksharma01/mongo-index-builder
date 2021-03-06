"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mongoConfigSchema = undefined;

var _joi = require("joi");

var _joi2 = _interopRequireDefault(_joi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mongoConfigSchema = exports.mongoConfigSchema = _joi2.default.object().keys({
  "connectionString": _joi2.default.string().required().description("The mongo db connection string"),
  "operationTimeout": _joi2.default.number().description("The operation timeout for mongo operations.")
}).required().example({
  "connectionString": "mongo://userName:Password@address:port/db",
  "operationTimeout": 5000
}); // Imports
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9zY2hlbWEocykvbW9uZ29Db25maWdTY2hlbWEuZXM2Il0sIm5hbWVzIjpbIm1vbmdvQ29uZmlnU2NoZW1hIiwib2JqZWN0Iiwia2V5cyIsInN0cmluZyIsInJlcXVpcmVkIiwiZGVzY3JpcHRpb24iLCJudW1iZXIiLCJleGFtcGxlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBRUE7Ozs7OztBQUVPLElBQU1BLGdEQUFvQixjQUFJQyxNQUFKLEdBQzlCQyxJQUQ4QixDQUN6QjtBQUNKLHNCQUFvQixjQUFJQyxNQUFKLEdBQWFDLFFBQWIsR0FBd0JDLFdBQXhCLENBQW9DLGdDQUFwQyxDQURoQjtBQUVKLHNCQUFvQixjQUFJQyxNQUFKLEdBQWFELFdBQWIsQ0FBeUIsNkNBQXpCO0FBRmhCLENBRHlCLEVBSTVCRCxRQUo0QixHQUs5QkcsT0FMOEIsQ0FLdEI7QUFDUCxzQkFBb0IsMkNBRGI7QUFFUCxzQkFBb0I7QUFGYixDQUxzQixDQUExQixDLENBSlAiLCJmaWxlIjoibW9uZ29Db25maWdTY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBJbXBvcnRzXG5cbmltcG9ydCBKb2kgZnJvbSBcImpvaVwiO1xuXG5leHBvcnQgY29uc3QgbW9uZ29Db25maWdTY2hlbWEgPSBKb2kub2JqZWN0KClcbiAgLmtleXMoe1xuICAgIFwiY29ubmVjdGlvblN0cmluZ1wiOiBKb2kuc3RyaW5nKCkucmVxdWlyZWQoKS5kZXNjcmlwdGlvbihcIlRoZSBtb25nbyBkYiBjb25uZWN0aW9uIHN0cmluZ1wiKSxcbiAgICBcIm9wZXJhdGlvblRpbWVvdXRcIjogSm9pLm51bWJlcigpLmRlc2NyaXB0aW9uKFwiVGhlIG9wZXJhdGlvbiB0aW1lb3V0IGZvciBtb25nbyBvcGVyYXRpb25zLlwiKVxuICB9KS5yZXF1aXJlZCgpXG4gIC5leGFtcGxlKHtcbiAgICBcImNvbm5lY3Rpb25TdHJpbmdcIjogXCJtb25nbzovL3VzZXJOYW1lOlBhc3N3b3JkQGFkZHJlc3M6cG9ydC9kYlwiLFxuICAgIFwib3BlcmF0aW9uVGltZW91dFwiOiA1MDAwXG4gIH0pO1xuIl19
//# sourceMappingURL=mongoConfigSchema.js.map
