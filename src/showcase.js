
$(document).ready(() => {

	// Constants declaration
	const API = "https://sudeepgandhiweb.firebaseio.com/showcase.json"; //database path

	// DOM references
	const clientGrid = $(".grid--client");
	const proGrid = $(".grid--proactive");
	const btnClient = $(".btn--client");
	const btnProactive = $(".btn--proactive");

	// initialise lazy loading
	let myLazyLoad;

	let timer;
	let isFirst = true;

	/**
	 * takes in response from firebase database
	 * and construct the grid showcase of the work done
	 * 
	 * @param {object} data 
	 */
	function constructGrid(gridData, gridType) {
		const dummyPanes = calcRequiredExtra(gridData.length);
		gridData.forEach((data, index) => {
			try {
				let card = $("<a href=" + data.link + "></a>").addClass('grid--cell card').attr('id', gridType + index);
				// let card = $("").addClass('');

				card.append($("<div class='project-image'><img data-original=" + data.image + "></div>").addClass('lazyload'));
				
				if(data.slide){
					slide.forEach(sl=>{
						card.append()
					})
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

		for (let i = 0; i < dummyPanes; i++) {
			let newGridElement = $("<div></div>").addClass('grid--cell empty-cell');
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
		return [2, 3, 4, 5].reduce((acc, size) => {
			const currentRequired = size - (available % size);
			return Math.max(currentRequired, acc);
		}, 0)
	}


	/**
	 * calls firebase data api , 
	 * fetches response and initiate grid construction
	 * 
	 */
	function beginShowcase() {
		$.get(API, response => {
			console.log(response);
		})
			.done(response => {
				for (let key in response) {
					constructGrid(response[key], key);
				}
				myLazyLoad = new LazyLoad();
				addHoverToCards();
			})
			.fail(error => {
				console.error(error.message);
			});
	}

	//------------- event listeners ---------------------

	/**
	 * 
	 */
	btnClient.on('click', () => {
		btnClient.addClass('active');
		btnProactive.removeClass('active')
		proGrid.addClass('hide');
		clientGrid.removeClass('hide');
	})

	btnProactive.on('click', () => {
		btnClient.removeClass('active');
		btnProactive.addClass('active')
		clientGrid.addClass('hide');
		proGrid.removeClass('hide');

	})

	function addHoverToCards() {
		$('.poject-image img:gt(0)').hide();
		$('.project-image').on('mouseenter', slideShow);
		$('.project-image').on('mouseleave', () => {
			clearInterval(timer);
			isFirst = true;
		});

	}




	beginShowcase();

	
	// slideshow 
	function slideShow(event) {
		timer = setInterval(() => {
			$(':first-child', this)
				.fadeOut()
				.next('img')
				.fadeIn()
				.end()
				.appendTo(this);
		}, 1000);
		isFirst = false;
	}

});