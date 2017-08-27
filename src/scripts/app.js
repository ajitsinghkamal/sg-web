/* eslint-disable import/prefer-default-export */
import $ from 'jquery';

export function classShuffleUtil(element, classToAdd, classToRemove) {
	if (typeof element === 'string' || element instanceof String) {
		$(element).removeClass(classToRemove).addClass(classToAdd);
	} else {
		element.forEach((el) => {
			$(el).removeClass(classToRemove).addClass(classToAdd);
		});
	}
}
