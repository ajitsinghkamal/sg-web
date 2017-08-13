
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

	/**
	 * takes in response from firebase database
	 * and construct the grid showcase of the work done
	 * 
	 * @param {object} data 
	 */
	function constructGrid(gridData, gridType) {
		const dummyPanes = calcRequiredExtra(gridData.length);
		gridData.forEach(data => {
			try {
				let card = $("<a href=" + data.link + "></a>").addClass('grid--cell card');
				// let card = $("").addClass('');
				card.append($("<div class='project-image'><img data-original=" + data.image + "></div>").addClass('lazyload'));
				card.append($("<div><h3>" + data.title + "</h3><p>" + data.tag + "</p></div>").addClass('project-desc'));
				// newGridElement.append($(card));

				addToGrid(gridType, card);

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

	beginShowcase();

});