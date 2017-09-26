import $ from 'jquery';
import slick from 'slick-carousel';

/**
 * initialise slick carousel instances
 */

$('.photo-slider').slick({
	slidesToScroll: 2,
	slidesToShow: 2,
	infinite: true,
	autoplay: true,
});

$('.client-content').slick({
	dots: true,
	autoplay: true,
});

$('.about-nav__link').on('click', function (event) {
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

