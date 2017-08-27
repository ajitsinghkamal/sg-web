import $ from 'jquery';
import slick from 'slick-carousel';

/**
 * initialise slick carousel instances
 */

$('.photo-slider').slick({
	rows: 2,
	slidesPerRow: 2,
});

$('.client-content').slick({
	dots: true,
	autoplay: true,
});

$('.link').on('click', function (event) {
	const hash = this.hash;
	if (hash !== '') {
		event.preventDefault();

		$('html, body').animate({
			scrollTop: $(hash).offset().top,
		}, 500, () => {
			window.location.hash = hash;
		});
	}
});

