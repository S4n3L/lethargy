"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Lethargy = function () {
  function Lethargy(options) {
    _classCallCheck(this, Lethargy);

    var DEFAULTS = {
      // Stability is how many records to use to calculate the average
      stability: 8,
      // The wheelDelta threshold. If an event has a wheelDelta below this value, it won't register
      sensitivity: 100,
      // How much the old rolling average have to differ
      // from the new rolling average for it to be deemed significant
      tolerance: 1.1,
      // Threshold for the amount of time between mousewheel events for them to be deemed separate
      delay: 150
    };
    this.opts = _extends({}, DEFAULTS, options);

    // Used internally and should not be manipulated
    this.lastUpDeltas = new Array(this.opts.stability * 2).fill(null);
    this.lastDownDeltas = new Array(this.opts.stability * 2).fill(null);
    this.deltasTimestamp = new Array(this.opts.stability * 2).fill(null);
  }

  _createClass(Lethargy, [{
    key: "handleEvent",


    // Checks whether the mousewheel event is an intent
    value: function handleEvent(event) {
      // Use jQuery's e.originalEvent if available
      var lastDelta = Lethargy.extractWheelDelta(event.originalEvent || event);

      // Add the new event timestamp to deltasTimestamp array, and remove the oldest entry
      this.deltasTimestamp.push(Date.now());
      this.deltasTimestamp.shift();

      // If lastDelta is positive, it means the user scrolled up
      if (lastDelta > 0) {
        this.lastUpDeltas.push(lastDelta);
        this.lastUpDeltas.shift();
        return this.isInertia(1);
      }
      // Otherwise the user scrolled down
      this.lastDownDeltas.push(lastDelta);
      this.lastDownDeltas.shift();
      return this.isInertia(-1);
    }

    // Checks if the event is an inertial scroll, if not, returns 1 or -1 depending on the direction
    // TODO: Change the name of the method, as it currently implies a boolean return value

  }, {
    key: "isInertia",
    value: function isInertia(direction) {
      // Get the relevant last*Delta array
      var lastDeltas = direction === -1 ? this.lastDownDeltas : this.lastUpDeltas;

      // If the array is not filled up yet, we cannot compare averages
      // so assume the scroll event to be intentional
      if (lastDeltas[0] === null) {
        return direction;
      }

      // If the last mousewheel occurred within the specified delay of the penultimate one,
      // and their values are the same. We will assume that this is a trackpad
      // with a constant profile and will return false
      if (this.deltasTimestamp[this.opts.stability * 2 - 2] + this.opts.delay > Date.now() && lastDeltas[0] === lastDeltas[this.opts.stability * 2 - 1]) {
        return false;
      }

      // Check to see if the new rolling average (based on the last half of the lastDeltas array)
      // is significantly higher than the old rolling average. If so return direction, else false
      var lastDeltasOld = lastDeltas.slice(0, this.opts.stability);
      var lastDeltasNew = lastDeltas.slice(this.opts.stability, this.opts.stability * 2);

      var oldSum = lastDeltasOld.reduce(function (t, s) {
        return t + s;
      });
      var newSum = lastDeltasNew.reduce(function (t, s) {
        return t + s;
      });

      var oldAverage = oldSum / lastDeltasOld.length;
      var newAverage = newSum / lastDeltasNew.length;

      if (Math.abs(oldAverage) < Math.abs(newAverage * this.opts.tolerance) && this.opts.sensitivity < Math.abs(newAverage)) {
        return direction;
      }
      return false;
    }
  }, {
    key: "showLastUpDeltas",
    value: function showLastUpDeltas() {
      return this.lastUpDeltas;
    }
  }, {
    key: "showLastDownDeltas",
    value: function showLastDownDeltas() {
      return this.lastDownDeltas;
    }
  }], [{
    key: "extractWheelDelta",
    value: function extractWheelDelta(event) {
      // Standardise wheelDelta values for different browsers
      if (event.wheelDelta !== null) {
        return event.wheelDelta;
      } else if (event.deltaY !== null) {
        return event.deltaY * -40;
      } else if (event.detail !== null || event.detail === 0) {
        return event.detail * -40;
      }
    }
  }]);

  return Lethargy;
}();
