// import * as firebase from 'firebase/app';
import 'firebase/database';

import $ from 'jquery';
import lazySizes from 'lazysizes';
import CommonUtil from './app';

// Constants declaration
// const API = 'https://sudeepgandhiweb.firebaseio.com/.json'; // database path

// DOM references
const clientGrid = $('.grid__client');
const proGrid = $('.grid__proactive');
const btnClient = $('.gallery__btn-client');
const btnProactive = $('.gallery__btn-proactive');
const gridHolder = $('.grid-holder');
const background = $('.work-page--bg');

let timer = null;

const slideMap = []; // holds id reference for divs with slideshow

const fire = new CommonUtil();
const db = fire.fireInstance.database();

/**
 * adds extra cells to the gallery
 * for proper alignment of the last row
 * @param {int} available number of slides to display in the gallery 
 */
const calcRequiredExtra = function calcRequiredExtraFunc(available) {
	return [2, 3, 4, 5].reduce((acc, size) => {
		const currentRequired = size - (available % size);
		return Math.max(currentRequired, acc);
	}, 0);
};

/**
 * adds grid to the gallery
 * @param {string} grid identifier 
 * @param {*} cell 
 */
const addToGrid = function addToGridFunc(grid, cell) {
	if (grid === 'client') {
		clientGrid.append(cell);
	}
	if (grid === 'pro') {
		proGrid.append(cell);
	}
};

// slideshow 
const slideShow = function slideShowFunc() {
	$(':first-child', this).fadeOut();
	$(':nth-child(2)', this).fadeIn(1000);
	timer = setInterval(() => {
		$(':nth-child(2)', this)
			.fadeOut(1000)
			.next()
			.fadeIn(1000)
			.end()
			.appendTo(this);
	}, 1200);
};

const endSlideShow = function endSlideShowFunc() {
	$(':first-child', this).fadeIn(1000);
	clearInterval(timer);
};


function addHoverToCards() {
	slideMap.forEach((slideDiv) => {
		$(`#${slideDiv}`).on('mouseenter', slideShow);
		$(`#${slideDiv}`).on('mouseleave', endSlideShow);
	});
}

/**
 * takes in response from firebase database
 * and construct the grid showcase of the work done
 * 
 * @param {object} data 
 */
const constructGrid = function constructGridFunc(gridData, gridType) {
	let gridLength = 0;
	Object.keys(gridData).forEach((data, index) => {
		try {
			const card = $(`<a href=overview?work=${data}></a>`).addClass('grid-cell card');

			const imgSlot = ($("<div class='card__image'></div>").attr('id', gridType + index));

			imgSlot.append($(`<img src=data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMyiqYBwAEbgHkSBS7fgAAAABJRU5ErkJggg== data-src=${gridData[data].thumb_image}></div>`).addClass('lazyload'));
			if (gridData[data].thumb_slide) {
				gridData[data].thumb_slide.forEach((sl) => {
					imgSlot.append($(`<img src=${sl}>`).hide());
				});
				slideMap.push(gridType + index);
			}
			card.append(imgSlot);
			card.append($(`<div><h3>${gridData[data].thumb_title}</h3><p>${gridData[data].thumb_tag}</p></div>`).addClass('card__desc'));

			addToGrid(gridType, card, index);
			gridLength += 1;
		} catch (error) {
			console.error(error.message);
		}
	});
	const dummyPanes = calcRequiredExtra(gridLength);

	for (let i = 0; i < dummyPanes; i += 1) {
		const newGridElement = $('<div></div>').addClass('grid-cell grid-cell--empty');
		addToGrid(gridType, newGridElement);
	}
};

/**
 * calls firebase data api , 
 * fetches response and initiate grid construction
 * 
 */
// const beginShowcase = function beginShowcaseFunc() {
// 	$.get(API, (response) => {
// 		Object.keys(response).forEach((key) => {
// 			constructGrid(response[key], key);
// 		});
// 	})
// 		.done(() => {
// 			addHoverToCards();
// 			$('.content--fetch').addClass('content--complete');
// 		})
// 		.fail((error) => {
// 			console.error(error.message);
// 		});
// };

db.ref('/').once('value').then((snapshot) => {
	if (snapshot.child('client').exists()) {
		constructGrid(snapshot.child('client').val(), 'client');
	}

	if (snapshot.child('pro').exists()) {
		constructGrid(snapshot.child('pro').val(), 'pro');
	}
}, (error) => {
	console.error(error.message);
})
	.then(() => {
		addHoverToCards();
		$('.content--fetch').addClass('content--complete');
	}, (error) => {
		console.error(error.message);
	});

// ------------- event listeners ---------------------

/**
 * 
 */
btnClient.on('click', () => {
/* 	background.removeClass('bg--reveal');
 */	btnClient.addClass('gallery--active');
	btnProactive.removeClass('gallery--active');
	gridHolder.removeClass('grid--slide');
});

btnProactive.on('click', () => {
/* 	background.addClass('bg--reveal');
 */	btnClient.removeClass('gallery--active');
	btnProactive.addClass('gallery--active');
	gridHolder.addClass('grid--slide');
});

// beginShowcase();

CommonUtil.initiateOffNav();

