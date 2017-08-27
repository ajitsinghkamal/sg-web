import $ from 'jquery';
import LazyLoad from 'vanilla-lazyload';

// Constants declaration
const API = 'https://sudeepgandhiweb.firebaseio.com/showcase.json'; // database path

// DOM references
const clientGrid = $('.grid--client');
const proGrid = $('.grid--proactive');
const btnClient = $('.btn--client');
const btnProactive = $('.btn--proactive');
const gridHolder = $('.grid-holder');

// initialise lazy loading
let myLazyLoad ;

let timer = null;

const slideMap = []; // holds id reference for divs with slideshow


const calcRequiredExtra = function calcRequiredExtraFunc(available) {
	return [2, 3, 4, 5].reduce((acc, size) => {
		const currentRequired = size - (available % size);
		return Math.max(currentRequired, acc);
	}, 0);
};

const addToGrid = function addToGridFunc(grid, cell) {
	if (grid === 'clientWork') {
		clientGrid.append(cell);
	} else {
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
	const dummyPanes = calcRequiredExtra(gridData.length);
	gridData.forEach((data, index) => {
		try {
			const card = $(`<a href=${data.link}></a>`).addClass('grid--cell card');

			const imgSlot = ($("<div class='project-image'></div>").attr('id', gridType + index));

			imgSlot.append($(`<img data-original=${data.image}></div>`).addClass('lazyload'));
			if (data.slide) {
				data.slide.forEach((sl) => {
					imgSlot.append($(`<img src=${sl}>`).hide());
				});
				slideMap.push(gridType + index);
			}
			card.append(imgSlot);
			card.append($(`<div><h3>${data.title}</h3><p>${data.tag}</p></div>`).addClass('project-desc'));

			addToGrid(gridType, card, index);
		} catch (error) {
			console.error(error.message);
		}
	});

	for (let i = 0; i < dummyPanes; i += 1) {
		const newGridElement = $('<div></div>').addClass('grid--cell empty-cell');
		addToGrid(gridType, newGridElement);
	}
};

/**
 * calls firebase data api , 
 * fetches response and initiate grid construction
 * 
 */
const beginShowcase = function beginShowcaseFunc() {
	$.get(API, (response) => {
		console.log(response);
	})
		.done((response) => {
			Object.keys(response).forEach((key) => {
				constructGrid(response[key], key);
			});

			myLazyLoad = new LazyLoad();
			addHoverToCards();
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
	btnClient.addClass('active');
	btnProactive.removeClass('active');
	gridHolder.removeClass('slide');
});

btnProactive.on('click', () => {
	btnClient.removeClass('active');
	btnProactive.addClass('active');
	gridHolder.addClass('slide');
});

beginShowcase();
