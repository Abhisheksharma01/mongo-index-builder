"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMongoMock;

var _q = require("q");

var _q2 = _interopRequireDefault(_q);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createMongoMock() {

  var mockgo = require("mockgo");

  return {
    getConnection: function getConnection() {
      return _q2.default.Promise(function (resolve, reject) {

        mockgo.getConnection("testDatabase", function (err, connection) {
          if (err !== null) {
            return reject(err);
          }
          return resolve({ "db": connection });
        });
      });
    },
    shutdown: function shutdown() {
      return _q2.default.Promise(function (resolve) {
        mockgo.shutDown(resolve);
      });
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvbW9ja3MvY3JlYXRlLW1vbmdvLmVzNiJdLCJuYW1lcyI6WyJjcmVhdGVNb25nb01vY2siLCJtb2NrZ28iLCJyZXF1aXJlIiwiZ2V0Q29ubmVjdGlvbiIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZXJyIiwiY29ubmVjdGlvbiIsInNodXRkb3duIiwic2h1dERvd24iXSwibWFwcGluZ3MiOiI7Ozs7O2tCQUV3QkEsZTs7QUFGeEI7Ozs7OztBQUVlLFNBQVNBLGVBQVQsR0FBMkI7O0FBRXhDLE1BQU1DLFNBQVNDLFFBQVEsUUFBUixDQUFmOztBQUVBLFNBQU87QUFDTEMsaUJBREssMkJBQ1c7QUFDZCxhQUFPLFlBQUVDLE9BQUYsQ0FBVSxVQUFVQyxPQUFWLEVBQW1CQyxNQUFuQixFQUEyQjs7QUFFMUNMLGVBQU9FLGFBQVAsQ0FBcUIsY0FBckIsRUFBcUMsVUFBQ0ksR0FBRCxFQUFNQyxVQUFOLEVBQXFCO0FBQ3hELGNBQUlELFFBQVEsSUFBWixFQUFrQjtBQUNoQixtQkFBT0QsT0FBT0MsR0FBUCxDQUFQO0FBQ0Q7QUFDRCxpQkFBT0YsUUFBUSxFQUFDLE1BQU1HLFVBQVAsRUFBUixDQUFQO0FBQ0QsU0FMRDtBQU1ELE9BUk0sQ0FBUDtBQVNELEtBWEk7QUFhTEMsWUFiSyxzQkFhTTtBQUNULGFBQU8sWUFBRUwsT0FBRixDQUFVLFVBQVVDLE9BQVYsRUFBbUI7QUFDbENKLGVBQU9TLFFBQVAsQ0FBZ0JMLE9BQWhCO0FBQ0QsT0FGTSxDQUFQO0FBR0Q7QUFqQkksR0FBUDtBQW1CRCIsImZpbGUiOiJjcmVhdGUtbW9uZ28uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUSBmcm9tIFwicVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVNb25nb01vY2soKSB7XG5cbiAgY29uc3QgbW9ja2dvID0gcmVxdWlyZShcIm1vY2tnb1wiKTtcblxuICByZXR1cm4ge1xuICAgIGdldENvbm5lY3Rpb24oKSB7XG4gICAgICByZXR1cm4gUS5Qcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICAgICBtb2NrZ28uZ2V0Q29ubmVjdGlvbihcInRlc3REYXRhYmFzZVwiLCAoZXJyLCBjb25uZWN0aW9uKSA9PiB7XG4gICAgICAgICAgaWYgKGVyciAhPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh7XCJkYlwiOiBjb25uZWN0aW9ufSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNodXRkb3duKCkge1xuICAgICAgcmV0dXJuIFEuUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICBtb2NrZ28uc2h1dERvd24ocmVzb2x2ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG4iXX0=
//# sourceMappingURL=create-mongo.js.map
