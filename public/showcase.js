"use strict";

$(document).ready(function () {

	// Constants declaration
	var API = "https://sudeepgandhiweb.firebaseio.com/showcase.json"; //database path

	// DOM references
	var clientGrid = $(".grid--client");
	var proGrid = $(".grid--proactive");
	var btnClient = $(".btn--client");
	var btnProactive = $(".btn--proactive");

	// initialise lazy loading
	var myLazyLoad = void 0;

	//  $('.photo-slider').slick({
	//       	 slidesToShow: 4,
	//       	 slidesToScroll: 4
	//       });
	// let timer;
	// let isFirst = true;

	/**
  * takes in response from firebase database
  * and construct the grid showcase of the work done
  * 
  * @param {object} data 
  */
	function constructGrid(gridData, gridType) {
		var dummyPanes = calcRequiredExtra(gridData.length);
		gridData.forEach(function (data, index) {
			try {
				var card = $("<a href=" + data.link + "></a>").addClass('grid--cell card');
				// let card = $("").addClass('');

				var imgSlot = $("<div class='project-image'></div>").attr('id', gridType + index);

				imgSlot.append($("<img data-original=" + data.image + "></div>").addClass('lazyload'));
				if (data.slide) {
					data.slide.forEach(function (sl) {
						imgSlot.append($("<img src=" + sl + ">").hide());
					});
				}
				card.append(imgSlot);
				card.append($("<div><h3>" + data.title + "</h3><p>" + data.tag + "</p></div>").addClass('project-desc'));
				// newGridElement.append($(card));


				addToGrid(gridType, card, index);
			} catch (error) {
				console.error(error.message);
			}
		});

		for (var i = 0; i < dummyPanes; i++) {
			var newGridElement = $("<div></div>").addClass('grid--cell empty-cell');
			addToGrid(gridType, newGridElement);
		}
	}

	function addToGrid(grid, cell, index) {

		if (grid === 'clientWork') {
			clientGrid.append(cell);
		} else {
			proGrid.append(cell);
		}
	}

	function calcRequiredExtra(available) {
		return [2, 3, 4, 5].reduce(function (acc, size) {
			var currentRequired = size - available % size;
			return Math.max(currentRequired, acc);
		}, 0);
	}

	/**
  * calls firebase data api , 
  * fetches response and initiate grid construction
  * 
  */
	function beginShowcase() {
		$.get(API, function (response) {
			console.log(response);
		}).done(function (response) {
			for (var key in response) {
				constructGrid(response[key], key);
			}
			myLazyLoad = new LazyLoad();
			addHoverToCards();
		}).fail(function (error) {
			console.error(error.message);
		});
	}

	//------------- event listeners ---------------------

	/**
  * 
  */
	btnClient.on('click', function () {
		btnClient.addClass('active');
		btnProactive.removeClass('active');
		proGrid.addClass('hide');
		clientGrid.removeClass('hide');
	});

	btnProactive.on('click', function () {
		btnClient.removeClass('active');
		btnProactive.addClass('active');
		clientGrid.addClass('hide');
		proGrid.removeClass('hide');
	});

	function addHoverToCards() {
		$('.project-image').on('mouseenter', slideShow);
		$('.project-image').on('mouseleave', function () {
			clearInterval(timer);
			isFirst = true;
		});
	}

	beginShowcase();

	// slideshow 
	function slideShow(event) {
		var _this = this;

		if (isFirst) {
			timer = setInterval(function () {
				$(':first-child', _this).fadeOut(800).next().fadeIn(800).end().appendTo(_this);
			}, 2400);
		}
		isFirst = false;
	}
});