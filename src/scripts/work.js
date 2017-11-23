// import * as firebase from 'firebase/app';
import 'firebase/database';

import $ from 'jquery';
import lazySizes from 'lazysizes';
import CommonUtil from './app';

// DOM references
const clientGrid = $('.grid__client');
const proGrid = $('.grid__proactive');
const btnClient = $('.gallery__btn-client');
const btnProactive = $('.gallery__btn-proactive');
const gridHolder = $('.grid-holder');
// const background = $('.work-page--bg');

let timer = null;

const slideMap = []; // holds id reference for divs with slideshow

const fire = new CommonUtil();
const db = fire.fireInstance.database(); // main database reference
const clientRef = db.ref('/client');	// client data reference
const proRef = db.ref('/pro');			// proactive data reference

// counter to keep track if all individal child node from client and proactive schema obtained
let gridToBuild = 2;

// keep track to get total number of child nodes for each
// doing this cause firebase doesnt provide a method for it
const count = {
	clientChild: 0,
	proChild: 0,
};


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

// destroy slideshowing on mouse out
const endSlideShow = function endSlideShowFunc() {
	$(':first-child', this).fadeIn(1000);
	clearInterval(timer);
};


function finaliseGrids() {
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
const constructGrid = function constructGridFunc(data, key, gridType) {
	try {
		const card = $(`<a href=overview?work=${key}></a>`).addClass('grid-cell card');

		const imgSlot = ($("<div class='card__image'></div>").attr('id', gridType + data.pos));

		imgSlot.append($(`<img src=data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMyiqYBwAEbgHkSBS7fgAAAABJRU5ErkJggg== data-src=${data.thumb_image}></div>`).addClass('lazyload'));
		if (data.thumb_slide) {
			data.thumb_slide.forEach((sl) => {
				imgSlot.append($(`<img src=${sl}>`).hide());
			});
			slideMap.push(gridType + data.pos);
		}
		card.append(imgSlot);
		card.append($(`<div><h3>${data.thumb_title}</h3><p>${data.thumb_tag}</p></div>`).addClass('card__desc'));

		addToGrid(gridType, card, data.pos);
	} catch (error) {
		console.error(error.message);
	}
};

const addDummyPanes = function addDummyPanes(gridType, gridLength) {
	const dummyPanes = calcRequiredExtra(gridLength);

	for (let i = 0; i < dummyPanes; i += 1) {
		const newGridElement = $('<div></div>').addClass('grid-cell grid-cell--empty');
		addToGrid(gridType, newGridElement);
	}
	console.log(gridToBuild);
};

const gridOrganiser = function gridOrganiser(snapshot, tcount, type) {
	const cardData = snapshot.val();
	const pos = parseInt(cardData.pos, 10);
	if (pos < tcount) {
		constructGrid(cardData, snapshot.key, type);
	} else {
		constructGrid(cardData, snapshot.key, type);
		addDummyPanes(type, tcount);
		gridToBuild -= 1;

		if (gridToBuild === 0) {
			finaliseGrids();
			$('.content--fetch').addClass('content--complete');
		}
	}
};


const countChildren = function CountChildren() {
	db.ref('/').once('value').then((snapshot) => {
		snapshot.child('client').forEach(() => {
			count.clientChild += 1;
		});
		snapshot.child('pro').forEach(() => {
			count.proChild += 1;
		});
	})
		.then(() => {
			gridToBuild = 2;
			clientRef.orderByChild('pos').on('child_added', (snapshot) => {
				gridOrganiser(snapshot, count.clientChild, 'client');
			});
			proRef.orderByChild('pos').on('child_added', (snapshot) => {
				gridOrganiser(snapshot, count.proChild, 'pro');
			});
		});
};

const showClientWork = function ShowClientWork() {
	btnClient.addClass('gallery--active');
	btnProactive.removeClass('gallery--active');
	gridHolder.removeClass('grid--slide');
};

const showActiveWork = function ShowActiveWork() {
	btnClient.removeClass('gallery--active');
	btnProactive.addClass('gallery--active');
	gridHolder.addClass('grid--slide');
};

/**
 * update active button according to url hash
 * comes to play when coming back from overview pages through tabbed navigation
 * 
*/
function getUrlHash() {
	if (!window.location.hash) {
		return;
	}
	const hash = window.location.hash.substring(1);

	if (hash === 'o-client') {
		showClientWork();
	} else {
		showActiveWork();
	}
	// remove hash from url
	history.pushState('', document.title, window.location.pathname);
}

// ------------- event listeners ---------------------

btnClient.on('click', showClientWork);
btnProactive.on('click', showActiveWork);


getUrlHash();
countChildren();
CommonUtil.initiateOffNav();
