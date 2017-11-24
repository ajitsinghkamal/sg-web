import $ from 'jquery';
import slick from 'slick-carousel';

import CommonUtil from './app';


/**
 * initialise slick carousel instances
 */

$('.photo-slider').slick({
	slidesToScroll: 1,
	slidesToShow: 1,
	infinite: true,
	autoplay: false,
	arrows: true,
	dots: true,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				arrows: false,
				draggable: true,
			},
		},
		{
			breakpoint: 960,
			settings: {
				arrows: false,
				draggable: true,
			},
		},
	],
});

$('.client-content').slick({
	dots: true,
	autoplay: false,
	draggable: true,
	arrows: true,
	responsive: [
		{
			breakpoint: 1024,
			settings: {
				arrows: false,
			},
		},
	],
});

$('.about-nav__link').on('click', function navJump(event) {
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

CommonUtil.initiateOffNav();

