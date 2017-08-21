"use strict";

function whichTransitionEvent() {
	var dummyEl = document.createElement('fakeelement');
	var transitions = {
		"WebkitAnimation": "webkitAnimationEnd",
		"MozAnimation": "animationend",
		'MSAnimation': 'MSAnimationEnd',
		"OAnimation": "oanimationend",
		"animation": "animationend"
	};

	for (var t in transitions) {
		if (dummyEl.style[t] !== undefined) {
			return transitions[t];
		}
	}
}

var transitionEvent = whichTransitionEvent();

$(document).ready(function () {
	var brush = document.querySelector(".brush-stroke");
	$(".brush-stroke").addClass('brush-art');
	brush.addEventListener(transitionEvent, function () {
		$(".brand-logo").removeClass('hide').addClass('reveal');
		$(".dash-navigation").removeClass('hide').addClass('reveal');
	}, false);
});
//# sourceMappingURL=maps/index.js.map
