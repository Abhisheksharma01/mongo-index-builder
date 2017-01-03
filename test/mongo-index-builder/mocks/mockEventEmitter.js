"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require("sinon");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockedEventEmitter = function () {
  function MockedEventEmitter() {
    _classCallCheck(this, MockedEventEmitter);

    this.emit = (0, _sinon.stub)();
    this.on = (0, _sinon.stub)();
  }

  _createClass(MockedEventEmitter, [{
    key: "reset",
    value: function reset() {
      this.emit.reset();
      this.on.reset();
    }
  }]);

  return MockedEventEmitter;
}();

exports.default = MockedEventEmitter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvbW9ja3MvbW9ja0V2ZW50RW1pdHRlci5lczYiXSwibmFtZXMiOlsiTW9ja2VkRXZlbnRFbWl0dGVyIiwiZW1pdCIsIm9uIiwicmVzZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7SUFFcUJBLGtCO0FBQ25CLGdDQUFjO0FBQUE7O0FBQ1osU0FBS0MsSUFBTCxHQUFZLGtCQUFaO0FBQ0EsU0FBS0MsRUFBTCxHQUFVLGtCQUFWO0FBQ0Q7Ozs7NEJBRU87QUFDTixXQUFLRCxJQUFMLENBQVVFLEtBQVY7QUFDQSxXQUFLRCxFQUFMLENBQVFDLEtBQVI7QUFDRDs7Ozs7O2tCQVRrQkgsa0IiLCJmaWxlIjoibW9ja0V2ZW50RW1pdHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7c3R1Yn0gZnJvbSBcInNpbm9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vY2tlZEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZW1pdCA9IHN0dWIoKTtcbiAgICB0aGlzLm9uID0gc3R1YigpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5lbWl0LnJlc2V0KCk7XG4gICAgdGhpcy5vbi5yZXNldCgpO1xuICB9XG59XG4iXX0=
//# sourceMappingURL=mockEventEmitter.js.map
