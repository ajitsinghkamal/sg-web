(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _slickCarousel = require('slick-carousel');

var _slickCarousel2 = _interopRequireDefault(_slickCarousel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * initialise slick carousel instances
 */

(0, _jquery2.default)('.photo-slider').slick({
	rows: 2,
	slidesPerRow: 2
});

(0, _jquery2.default)('.client-content').slick({
	dots: true,
	autoplay: true
});

(0, _jquery2.default)('.about-nav__link').on('click', function (event) {
	var hash = this.hash;
	if (hash !== '') {
		event.preventDefault();

		(0, _jquery2.default)('html, body').animate({
			scrollTop: (0, _jquery2.default)(hash).offset().top
		}, 500, function () {
			window.location.hash = hash;
		});
	}
});

},{"jquery":"jquery","slick-carousel":"slick-carousel"}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9hYm91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUE7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7QUFJQSxzQkFBRSxlQUFGLEVBQW1CLEtBQW5CLENBQXlCO0FBQ3hCLE9BQU0sQ0FEa0I7QUFFeEIsZUFBYztBQUZVLENBQXpCOztBQUtBLHNCQUFFLGlCQUFGLEVBQXFCLEtBQXJCLENBQTJCO0FBQzFCLE9BQU0sSUFEb0I7QUFFMUIsV0FBVTtBQUZnQixDQUEzQjs7QUFLQSxzQkFBRSxrQkFBRixFQUFzQixFQUF0QixDQUF5QixPQUF6QixFQUFrQyxVQUFVLEtBQVYsRUFBaUI7QUFDbEQsS0FBTSxPQUFPLEtBQUssSUFBbEI7QUFDQSxLQUFJLFNBQVMsRUFBYixFQUFpQjtBQUNoQixRQUFNLGNBQU47O0FBRUEsd0JBQUUsWUFBRixFQUFnQixPQUFoQixDQUF3QjtBQUN2QixjQUFXLHNCQUFFLElBQUYsRUFBUSxNQUFSLEdBQWlCO0FBREwsR0FBeEIsRUFFRyxHQUZILEVBRVEsWUFBTTtBQUNiLFVBQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixJQUF2QjtBQUNBLEdBSkQ7QUFLQTtBQUNELENBWEQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCBzbGljayBmcm9tICdzbGljay1jYXJvdXNlbCc7XG5cbi8qKlxuICogaW5pdGlhbGlzZSBzbGljayBjYXJvdXNlbCBpbnN0YW5jZXNcbiAqL1xuXG4kKCcucGhvdG8tc2xpZGVyJykuc2xpY2soe1xuXHRyb3dzOiAyLFxuXHRzbGlkZXNQZXJSb3c6IDIsXG59KTtcblxuJCgnLmNsaWVudC1jb250ZW50Jykuc2xpY2soe1xuXHRkb3RzOiB0cnVlLFxuXHRhdXRvcGxheTogdHJ1ZSxcbn0pO1xuXG4kKCcuYWJvdXQtbmF2X19saW5rJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cdGNvbnN0IGhhc2ggPSB0aGlzLmhhc2g7XG5cdGlmIChoYXNoICE9PSAnJykge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHQkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG5cdFx0XHRzY3JvbGxUb3A6ICQoaGFzaCkub2Zmc2V0KCkudG9wLFxuXHRcdH0sIDUwMCwgKCkgPT4ge1xuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSBoYXNoO1xuXHRcdH0pO1xuXHR9XG59KTtcblxuIl19
