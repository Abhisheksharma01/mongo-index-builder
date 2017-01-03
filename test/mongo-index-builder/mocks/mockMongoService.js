"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require("sinon");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MongodbClient = function () {
  function MongodbClient() {
    _classCallCheck(this, MongodbClient);

    this.createIndex = (0, _sinon.stub)();
    this.dropIndex = (0, _sinon.stub)();
    this.connect = (0, _sinon.stub)();
    this.getIndexes = (0, _sinon.stub)();
  }

  _createClass(MongodbClient, [{
    key: "reset",
    value: function reset() {
      this.createIndex.reset();
      this.dropIndex.reset();
      this.connect.reset();
      this.getIndexes.reset();
    }
  }]);

  return MongodbClient;
}();

exports.default = MongodbClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvbW9ja3MvbW9ja01vbmdvU2VydmljZS5lczYiXSwibmFtZXMiOlsiTW9uZ29kYkNsaWVudCIsImNyZWF0ZUluZGV4IiwiZHJvcEluZGV4IiwiY29ubmVjdCIsImdldEluZGV4ZXMiLCJyZXNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7OztJQUVxQkEsYTtBQUNuQiwyQkFBYztBQUFBOztBQUNaLFNBQUtDLFdBQUwsR0FBbUIsa0JBQW5CO0FBQ0EsU0FBS0MsU0FBTCxHQUFpQixrQkFBakI7QUFDQSxTQUFLQyxPQUFMLEdBQWUsa0JBQWY7QUFDQSxTQUFLQyxVQUFMLEdBQWtCLGtCQUFsQjtBQUNEOzs7OzRCQUVPO0FBQ04sV0FBS0gsV0FBTCxDQUFpQkksS0FBakI7QUFDQSxXQUFLSCxTQUFMLENBQWVHLEtBQWY7QUFDQSxXQUFLRixPQUFMLENBQWFFLEtBQWI7QUFDQSxXQUFLRCxVQUFMLENBQWdCQyxLQUFoQjtBQUNEOzs7Ozs7a0JBYmtCTCxhIiwiZmlsZSI6Im1vY2tNb25nb1NlcnZpY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge3N0dWJ9IGZyb20gXCJzaW5vblwiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25nb2RiQ2xpZW50IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jcmVhdGVJbmRleCA9IHN0dWIoKTtcbiAgICB0aGlzLmRyb3BJbmRleCA9IHN0dWIoKTtcbiAgICB0aGlzLmNvbm5lY3QgPSBzdHViKCk7XG4gICAgdGhpcy5nZXRJbmRleGVzID0gc3R1YigpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5jcmVhdGVJbmRleC5yZXNldCgpO1xuICAgIHRoaXMuZHJvcEluZGV4LnJlc2V0KCk7XG4gICAgdGhpcy5jb25uZWN0LnJlc2V0KCk7XG4gICAgdGhpcy5nZXRJbmRleGVzLnJlc2V0KCk7XG4gIH1cbn1cbiJdfQ==
//# sourceMappingURL=mockMongoService.js.map
