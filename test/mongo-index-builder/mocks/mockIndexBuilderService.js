"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sinon = require("sinon");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require("sinon-as-promised");

var indexBuilderService = function () {
  function indexBuilderService() {
    _classCallCheck(this, indexBuilderService);

    this.buildIndexes = (0, _sinon.stub)();
  }

  _createClass(indexBuilderService, [{
    key: "reset",
    value: function reset() {
      this.buildIndexes.reset();
    }
  }]);

  return indexBuilderService;
}();

exports.default = indexBuilderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QtbGliL21vbmdvLWluZGV4LWJ1aWxkZXIvbW9ja3MvbW9ja0luZGV4QnVpbGRlclNlcnZpY2UuZXM2Il0sIm5hbWVzIjpbInJlcXVpcmUiLCJpbmRleEJ1aWxkZXJTZXJ2aWNlIiwiYnVpbGRJbmRleGVzIiwicmVzZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7Ozs7QUFDQUEsUUFBUSxtQkFBUjs7SUFFcUJDLG1CO0FBQ25CLGlDQUFjO0FBQUE7O0FBQ1osU0FBS0MsWUFBTCxHQUFvQixrQkFBcEI7QUFDRDs7Ozs0QkFFTztBQUNOLFdBQUtBLFlBQUwsQ0FBa0JDLEtBQWxCO0FBQ0Q7Ozs7OztrQkFQa0JGLG1CIiwiZmlsZSI6Im1vY2tJbmRleEJ1aWxkZXJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtzdHVifSBmcm9tIFwic2lub25cIjtcbnJlcXVpcmUoXCJzaW5vbi1hcy1wcm9taXNlZFwiKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgaW5kZXhCdWlsZGVyU2VydmljZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYnVpbGRJbmRleGVzID0gc3R1YigpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5idWlsZEluZGV4ZXMucmVzZXQoKTtcbiAgfVxufVxuIl19
//# sourceMappingURL=mockIndexBuilderService.js.map
