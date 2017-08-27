import $ from 'jquery';
import { classShuffleUtil } from './app';

const brush = document.querySelector('.brush-stroke');

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

$('.brush-stroke').addClass('brush-art');

brush.addEventListener(animationEvent, () => {
	classShuffleUtil(['.brand-logo', '.dash-navigation'], 'reveal', 'hide');
}, false);
