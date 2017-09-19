(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var brush = document.querySelector('.banner__brush');

/**
 * determine the correct browser specific animation end event
 * 
 */
var browserAnimationCheck = function whichAnimationEvent() {
	var dummyEl = document.createElement('fakeelement');
	var animationEventMap = new Map();
	animationEventMap.set('WebkitAnimation', 'webkitAnimationEnd');
	animationEventMap.set('MozAnimation', 'animationend');
	animationEventMap.set('MSAnimation', 'MSAnimationEnd');
	animationEventMap.set('OAnimation', 'oanimationend');
	animationEventMap.set('animation', 'animationend');

	/* eslint-disable no-restricted-syntax */
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = animationEventMap[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _ref = _step.value;

			var _ref2 = _slicedToArray(_ref, 2);

			var event = _ref2[0];
			var value = _ref2[1];

			if (dummyEl.style[event] !== undefined) {
				return value;
			}
		}
		/* eslint-enable no-restricted-syntax */
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return undefined;
};

var animationEvent = browserAnimationCheck();

function classShuffleUtil(element, classToAdd, classToRemove) {
	if (typeof element === 'string' || element instanceof String) {
		(0, _jquery2.default)(element).removeClass(classToRemove).addClass(classToAdd);
	} else {
		element.forEach(function (el) {
			(0, _jquery2.default)(el).removeClass(classToRemove).addClass(classToAdd);
		});
	}
}

(0, _jquery2.default)('.banner__brush').addClass('banner__brush--art');

brush.addEventListener(animationEvent, function () {
	classShuffleUtil(['.banner__logo', '.cover-page__navigation'], 'cover-page--reveal', 'cover-page--hide');
}, false);

},{"jquery":"jquery"}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQTs7Ozs7O0FBRUEsSUFBTSxRQUFRLFNBQVMsYUFBVCxDQUF1QixnQkFBdkIsQ0FBZDs7QUFFQTs7OztBQUlBLElBQU0sd0JBQXdCLFNBQVMsbUJBQVQsR0FBK0I7QUFDNUQsS0FBTSxVQUFVLFNBQVMsYUFBVCxDQUF1QixhQUF2QixDQUFoQjtBQUNBLEtBQU0sb0JBQW9CLElBQUksR0FBSixFQUExQjtBQUNBLG1CQUFrQixHQUFsQixDQUFzQixpQkFBdEIsRUFBeUMsb0JBQXpDO0FBQ0EsbUJBQWtCLEdBQWxCLENBQXNCLGNBQXRCLEVBQXNDLGNBQXRDO0FBQ0EsbUJBQWtCLEdBQWxCLENBQXNCLGFBQXRCLEVBQXFDLGdCQUFyQztBQUNBLG1CQUFrQixHQUFsQixDQUFzQixZQUF0QixFQUFvQyxlQUFwQztBQUNBLG1CQUFrQixHQUFsQixDQUFzQixXQUF0QixFQUFtQyxjQUFuQzs7QUFFQTtBQVQ0RDtBQUFBO0FBQUE7O0FBQUE7QUFVNUQsdUJBQTZCLGlCQUE3Qiw4SEFBZ0Q7QUFBQTs7QUFBQTs7QUFBQSxPQUFwQyxLQUFvQztBQUFBLE9BQTdCLEtBQTZCOztBQUMvQyxPQUFJLFFBQVEsS0FBUixDQUFjLEtBQWQsTUFBeUIsU0FBN0IsRUFBd0M7QUFDdkMsV0FBTyxLQUFQO0FBQ0E7QUFDRDtBQUNEO0FBZjREO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBaUI1RCxRQUFPLFNBQVA7QUFDQSxDQWxCRDs7QUFvQkEsSUFBTSxpQkFBaUIsdUJBQXZCOztBQUVBLFNBQVMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBbUMsVUFBbkMsRUFBK0MsYUFBL0MsRUFBOEQ7QUFDN0QsS0FBSSxPQUFPLE9BQVAsS0FBbUIsUUFBbkIsSUFBK0IsbUJBQW1CLE1BQXRELEVBQThEO0FBQzdELHdCQUFFLE9BQUYsRUFBVyxXQUFYLENBQXVCLGFBQXZCLEVBQXNDLFFBQXRDLENBQStDLFVBQS9DO0FBQ0EsRUFGRCxNQUVPO0FBQ04sVUFBUSxPQUFSLENBQWdCLFVBQUMsRUFBRCxFQUFRO0FBQ3ZCLHlCQUFFLEVBQUYsRUFBTSxXQUFOLENBQWtCLGFBQWxCLEVBQWlDLFFBQWpDLENBQTBDLFVBQTFDO0FBQ0EsR0FGRDtBQUdBO0FBQ0Q7O0FBRUQsc0JBQUUsZ0JBQUYsRUFBb0IsUUFBcEIsQ0FBNkIsb0JBQTdCOztBQUVBLE1BQU0sZ0JBQU4sQ0FBdUIsY0FBdkIsRUFBdUMsWUFBTTtBQUM1QyxrQkFBaUIsQ0FBQyxlQUFELEVBQWtCLHlCQUFsQixDQUFqQixFQUErRCxvQkFBL0QsRUFBcUYsa0JBQXJGO0FBQ0EsQ0FGRCxFQUVHLEtBRkgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcblxuY29uc3QgYnJ1c2ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuYmFubmVyX19icnVzaCcpO1xuXG4vKipcbiAqIGRldGVybWluZSB0aGUgY29ycmVjdCBicm93c2VyIHNwZWNpZmljIGFuaW1hdGlvbiBlbmQgZXZlbnRcbiAqIFxuICovXG5jb25zdCBicm93c2VyQW5pbWF0aW9uQ2hlY2sgPSBmdW5jdGlvbiB3aGljaEFuaW1hdGlvbkV2ZW50KCkge1xuXHRjb25zdCBkdW1teUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZmFrZWVsZW1lbnQnKTtcblx0Y29uc3QgYW5pbWF0aW9uRXZlbnRNYXAgPSBuZXcgTWFwKCk7XG5cdGFuaW1hdGlvbkV2ZW50TWFwLnNldCgnV2Via2l0QW5pbWF0aW9uJywgJ3dlYmtpdEFuaW1hdGlvbkVuZCcpO1xuXHRhbmltYXRpb25FdmVudE1hcC5zZXQoJ01vekFuaW1hdGlvbicsICdhbmltYXRpb25lbmQnKTtcblx0YW5pbWF0aW9uRXZlbnRNYXAuc2V0KCdNU0FuaW1hdGlvbicsICdNU0FuaW1hdGlvbkVuZCcpO1xuXHRhbmltYXRpb25FdmVudE1hcC5zZXQoJ09BbmltYXRpb24nLCAnb2FuaW1hdGlvbmVuZCcpO1xuXHRhbmltYXRpb25FdmVudE1hcC5zZXQoJ2FuaW1hdGlvbicsICdhbmltYXRpb25lbmQnKTtcblxuXHQvKiBlc2xpbnQtZGlzYWJsZSBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuXHRmb3IgKGNvbnN0IFtldmVudCwgdmFsdWVdIG9mIGFuaW1hdGlvbkV2ZW50TWFwKSB7XG5cdFx0aWYgKGR1bW15RWwuc3R5bGVbZXZlbnRdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdH1cblx0LyogZXNsaW50LWVuYWJsZSBuby1yZXN0cmljdGVkLXN5bnRheCAqL1xuXG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5jb25zdCBhbmltYXRpb25FdmVudCA9IGJyb3dzZXJBbmltYXRpb25DaGVjaygpO1xuXG5mdW5jdGlvbiBjbGFzc1NodWZmbGVVdGlsKGVsZW1lbnQsIGNsYXNzVG9BZGQsIGNsYXNzVG9SZW1vdmUpIHtcblx0aWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJyB8fCBlbGVtZW50IGluc3RhbmNlb2YgU3RyaW5nKSB7XG5cdFx0JChlbGVtZW50KS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKS5hZGRDbGFzcyhjbGFzc1RvQWRkKTtcblx0fSBlbHNlIHtcblx0XHRlbGVtZW50LmZvckVhY2goKGVsKSA9PiB7XG5cdFx0XHQkKGVsKS5yZW1vdmVDbGFzcyhjbGFzc1RvUmVtb3ZlKS5hZGRDbGFzcyhjbGFzc1RvQWRkKTtcblx0XHR9KTtcblx0fVxufVxuXG4kKCcuYmFubmVyX19icnVzaCcpLmFkZENsYXNzKCdiYW5uZXJfX2JydXNoLS1hcnQnKTtcblxuYnJ1c2guYWRkRXZlbnRMaXN0ZW5lcihhbmltYXRpb25FdmVudCwgKCkgPT4ge1xuXHRjbGFzc1NodWZmbGVVdGlsKFsnLmJhbm5lcl9fbG9nbycsICcuY292ZXItcGFnZV9fbmF2aWdhdGlvbiddLCAnY292ZXItcGFnZS0tcmV2ZWFsJywgJ2NvdmVyLXBhZ2UtLWhpZGUnKTtcbn0sIGZhbHNlKTtcbiJdfQ==
