function whichTransitionEvent() {
	const dummyEl = document.createElement('fakeelement');
	const transitions = {
		"WebkitAnimation": "webkitAnimationEnd",
		"MozAnimation": "animationend",
		'MSAnimation' :'MSAnimationEnd',
		"OAnimation": "oanimationend",
		"animation": "animationend"
	}

	for (let t in transitions) {
		if (dummyEl.style[t] !== undefined) {
			return transitions[t];
		}
	}
}

const transitionEvent = whichTransitionEvent();

$(document).ready(() => {
	const brush = document.querySelector(".brush-overlay");
	$(".brush-overlay").addClass('brush-art');
	brush.addEventListener(transitionEvent, () => {
		$(".brand-logo").removeClass('hide').addClass('reveal');
		$(".dash-navigation").removeClass('hide').addClass('reveal');
	},false );
});