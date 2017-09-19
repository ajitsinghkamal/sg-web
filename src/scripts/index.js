import $ from 'jquery';

const brush = document.querySelector('.banner__brush');

/**
 * determine the correct browser specific animation end event
 * 
 */
const browserAnimationCheck = function whichAnimationEvent() {
	const dummyEl = document.createElement('fakeelement');
	const animationEventMap = new Map();
	animationEventMap.set('WebkitAnimation', 'webkitAnimationEnd');
	animationEventMap.set('MozAnimation', 'animationend');
	animationEventMap.set('MSAnimation', 'MSAnimationEnd');
	animationEventMap.set('OAnimation', 'oanimationend');
	animationEventMap.set('animation', 'animationend');

	/* eslint-disable no-restricted-syntax */
	for (const [event, value] of animationEventMap) {
		if (dummyEl.style[event] !== undefined) {
			return value;
		}
	}
	/* eslint-enable no-restricted-syntax */

	return undefined;
};

const animationEvent = browserAnimationCheck();

function classShuffleUtil(element, classToAdd, classToRemove) {
	if (typeof element === 'string' || element instanceof String) {
		$(element).removeClass(classToRemove).addClass(classToAdd);
	} else {
		element.forEach((el) => {
			$(el).removeClass(classToRemove).addClass(classToAdd);
		});
	}
}

$('.banner__brush').addClass('banner__brush--art');

brush.addEventListener(animationEvent, () => {
	classShuffleUtil(['.banner__logo', '.cover-page__navigation'], 'cover-page--reveal', 'cover-page--hide');
}, false);
