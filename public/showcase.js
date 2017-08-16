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

	var timer = void 0;
	var isFirst = true;

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
				var card = $("<a href=" + data.link + "></a>").addClass('grid--cell card').attr('id', gridType + index);
				// let card = $("").addClass('');

				card.append($("<div class='project-image'><img data-original=" + data.image + "></div>").addClass('lazyload'));

				if (data.slide) {
					slide.forEach(function (sl) {
						card.append();
					});
				}
				card.append($("<div><h3>" + data.title + "</h3><p>" + data.tag + "</p></div>").addClass('project-desc'));
				// newGridElement.append($(card));


				addToGrid(gridType, card);
				// $(gridType + index).on('mouseenter', slideShow, function () {

				// });

				console.log($(gridType + index));
			} catch (error) {
				console.error(error.message);
			}
		});

		for (var i = 0; i < dummyPanes; i++) {
			var newGridElement = $("<div></div>").addClass('grid--cell empty-cell');
			addToGrid(gridType, newGridElement);
		}
	}

	function addToGrid(grid, cell) {
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
		$('.poject-image img:gt(0)').hide();
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

		timer = setInterval(function () {
			$(':first-child', _this).fadeOut().next('img').fadeIn().end().appendTo(_this);
		}, 1000);
		isFirst = false;
	}
});