import $ from 'jquery';

// import * as firebase from 'firebase/app';
// import 'firebase/database';

import LazyLoad from 'vanilla-lazyload';

// Constants declaration
const API = 'https://sudeepgandhiweb.firebaseio.com/.json'; // database path

// const fire = firebase.initializeApp({
// 	apiKey: 'AIzaSyDiMtPwt58-NEnR56kTzJ9HddG5IrGuhrE',
// 	authDomain: 'sudeepgandhiweb.firebaseapp.com',
// 	databaseURL: 'https://sudeepgandhiweb.firebaseio.com',
// 	projectId: 'sudeepgandhiweb',
// });

// const db = fire.database();


// DOM references
const clientGrid = $('.grid__client');
const proGrid = $('.grid__proactive');
const btnClient = $('.gallery__btn-client');
const btnProactive = $('.gallery__btn-proactive');
const gridHolder = $('.grid-holder');
const background = $('.work-page');

// initialise lazy loading
let myLazyLoad1 ;
let myLazyLoad2 ;

let timer = null;

const slideMap = []; // holds id reference for divs with slideshow


const calcRequiredExtra = function calcRequiredExtraFunc(available) {
	return [2, 3, 4, 5].reduce((acc, size) => {
		const currentRequired = size - (available % size);
		return Math.max(currentRequired, acc);
	}, 0);
};

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

			imgSlot.append($(`<img data-original=${gridData[data].thumb_image}></div>`).addClass('lazyload'));
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

// db.ref().on('value', (snapshot) => {
// 	const clientWorkList = snapshot.child('client').val();
// 	constructGrid(clientWorkList, 'client');
// 	const proWorkList = snapshot.child('pro').val();
// 	constructGrid(proWorkList, 'pro');

// 	myLazyLoad = new LazyLoad();
// 	addHoverToCards();
// });
// db.ref('/pro/').once('value', (snapshot) => {
// });

/**
 * calls firebase data api , 
 * fetches response and initiate grid construction
 * 
 */
const beginShowcase = function beginShowcaseFunc() {
	$.get(API, (response) => {
		// console.log(response);
	})
		.done((response) => {
			Object.keys(response).forEach((key) => {
				constructGrid(response[key], key);
			});

			myLazyLoad1 = new LazyLoad({
				container: document.getElementById('o-client'),
			});

			myLazyLoad2 = new LazyLoad({
				container: document.getElementById('o-proactive'),
			});

			addHoverToCards();
			$('.grid--fetch').addClass('grid--complete');
		})
		.fail((error) => {
			console.error(error.message);
		});
};

// ------------- event listeners ---------------------

/**
 * 
 */
btnClient.on('click', () => {
	background.removeClass('work-page--bg');
	btnClient.addClass('gallery--active');
	btnProactive.removeClass('gallery--active');
	gridHolder.removeClass('grid--slide');
});

btnProactive.on('click', () => {
	background.addClass('work-page--bg');
	btnClient.removeClass('gallery--active');
	btnProactive.addClass('gallery--active');
	gridHolder.addClass('grid--slide');
});

beginShowcase();

