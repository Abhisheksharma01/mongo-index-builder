"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @module argumentUndefined
 */

/**
 * Error object. Thrown when a argument of a method is undefined or null.
 *
 * @class argumentUndefined
 * @param {string} argumentName - This is the name of the parameter that has
 * failed an undefined or null check.
 */
var argumentUndefined = function (_Error) {
  _inherits(argumentUndefined, _Error);

  function argumentUndefined(argumentName) {
    _classCallCheck(this, argumentUndefined);

    var _this = _possibleConstructorReturn(this, (argumentUndefined.__proto__ || Object.getPrototypeOf(argumentUndefined)).call(this, "Argument " + argumentName + " expected to be defined."));

    _this.errorName = argumentUndefined.name;
    _this[argumentName] = argumentName;
    return _this;
  }

  return argumentUndefined;
}(Error);

exports.default = argumentUndefined;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2xpYi9jdXN0b21FcnJvcnMvYXJndW1lbnRVbmRlZmluZWQuZXM2Il0sIm5hbWVzIjpbImFyZ3VtZW50VW5kZWZpbmVkIiwiYXJndW1lbnROYW1lIiwiZXJyb3JOYW1lIiwibmFtZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUlBOzs7Ozs7O0lBT3FCQSxpQjs7O0FBQ25CLDZCQUFZQyxZQUFaLEVBQTBCO0FBQUE7O0FBQUEsb0pBQ05BLFlBRE07O0FBRXhCLFVBQUtDLFNBQUwsR0FBaUJGLGtCQUFrQkcsSUFBbkM7QUFDQSxVQUFLRixZQUFMLElBQXFCQSxZQUFyQjtBQUh3QjtBQUl6Qjs7O0VBTDRDRyxLOztrQkFBMUJKLGlCIiwiZmlsZSI6ImFyZ3VtZW50VW5kZWZpbmVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbW9kdWxlIGFyZ3VtZW50VW5kZWZpbmVkXG4gKi9cblxuLyoqXG4gKiBFcnJvciBvYmplY3QuIFRocm93biB3aGVuIGEgYXJndW1lbnQgb2YgYSBtZXRob2QgaXMgdW5kZWZpbmVkIG9yIG51bGwuXG4gKlxuICogQGNsYXNzIGFyZ3VtZW50VW5kZWZpbmVkXG4gKiBAcGFyYW0ge3N0cmluZ30gYXJndW1lbnROYW1lIC0gVGhpcyBpcyB0aGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIHRoYXQgaGFzXG4gKiBmYWlsZWQgYW4gdW5kZWZpbmVkIG9yIG51bGwgY2hlY2suXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIGFyZ3VtZW50VW5kZWZpbmVkIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3Rvcihhcmd1bWVudE5hbWUpIHtcbiAgICBzdXBlcihgQXJndW1lbnQgJHthcmd1bWVudE5hbWV9IGV4cGVjdGVkIHRvIGJlIGRlZmluZWQuYCk7XG4gICAgdGhpcy5lcnJvck5hbWUgPSBhcmd1bWVudFVuZGVmaW5lZC5uYW1lO1xuICAgIHRoaXNbYXJndW1lbnROYW1lXSA9IGFyZ3VtZW50TmFtZTtcbiAgfVxufVxuIl19
//# sourceMappingURL=argumentUndefined.js.map
