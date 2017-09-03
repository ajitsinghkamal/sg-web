import $ from 'jquery';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

// Initialise firebase
const fire = firebase.initializeApp({
	apiKey: 'AIzaSyDiMtPwt58-NEnR56kTzJ9HddG5IrGuhrE',
	authDomain: 'sudeepgandhiweb.firebaseapp.com',
	databaseURL: 'https://sudeepgandhiweb.firebaseio.com',
	projectId: 'sudeepgandhiweb',
});

const auth = fire.auth();
const db = fire.database();

let clientWorkList = {};
let proWorkList = {};

let data = {
	type: '', // client work or proactive work
	identifier: '',
};

const detailsData = {
	thumb_image: '',	// work page sets thumbnail in gallery
	thumb_tag: '',		// work page description tag
	thumb_title: '',
	thumb_slide: [],	// work page array of rotating slides

	desc_logo: '',
	desc_heading: '',
	desc_intro: '',
	desc_note: '',
};

auth.onAuthStateChanged((user) => {
	if (user) { 	// user signed in
		$('.login').addClass('hide');
		$('.dashboard').removeClass('hide');
	} else { 		// user signed out
		$('.dashboard').addClass('hide');
		$('.login').removeClass('hide');
	}
});

const getSnapshot = function getSnapshotDB() {
	db.ref('/client/').on('value', (snapshot) => {
		clientWorkList = snapshot.val();
	});
	db.ref('/pro/').on('value', (snapshot) => {
		proWorkList = snapshot.val();
	});
};

/**
 * authenticates user for firebase access
 * 
 */
const authenticate = function authenticateCreds() {
	const email = $('#email').val();
	const password = $('#password').val();

	auth.signInWithEmailAndPassword(email, password)
		.catch((error) => {
			console.error(error.message);
		})
		.then((user) => {
			if (user) {
				getSnapshot();
				console.log('success');
			}
		});
};

/**
 * map input values to correct data keys for gallery page
 * 
 * @param {int} index 
 */
function setDataGallery(index) {
	switch (index) {
	case 0:
		data.identifier = $(this).val();
		break;
	case 1:
		detailsData.thumb_image = $(this).val();
		break;
	case 2:
		detailsData.thumb_tag = $(this).val();
		break;
	case 3:
		detailsData.thumb_title = $(this).val();
		break;
	default:
		detailsData.thumb_slide.push($(this).val());
		break;
	}
}

/**
 * map input values to correct data keys for overview page
 * 
 * @param {any} index 
 */
function setOverviewData(index) {
	switch (index) {
	case 0:
		detailsData.desc_logo = $(this).val();
		break;
	case 1:
		detailsData.desc_heading = $(this).val();
		break;
	case 2:
		detailsData.desc_intro = $(this).val();
		break;
	case 3:
		detailsData.desc_note = $(this).val();
		break;
	default:
		break;
	}
}

function writeUserData() {
	switch (data.type) {
	case 'client':
		// clientWorkList.push(detailsData);
		db.ref(`client/${data.identifier}`).set(detailsData);
		break;
	case 'pro':
		// proWorkList.push(detailsData);
		db.ref(`pro/${data.identifier}`).set(detailsData);
		break;
	default:
		console.log('invalid');
		break;
	}
}

const resetForm = function resetFormFunc() {
	$('form').find('input[type=text]').val('');
	$('mock-input:gt(0)').remove();
	$('or-input:gt(0)').remove();
	$('el-input:gt(0)').remove();
};

// ============ event handlers =======================

$('#login-form').submit((e) => {
	e.preventDefault();
	authenticate();
});

$('.signout-btn').on('click', () => {
	auth.signOut();
});

$('.slides-input--btn').on('click', () => {
	$('.slides-input').append('<label>Slide<input type="text" class="field" placeholder="image for slideshow thumbnail"></label>');
});

$('#mock-btn').on('click', () => {
	$('.mock-input').append('<label>Work mocks<input type="text" class="field" placeholder="mocks"></label>');
});

$('#or-btn').on('click', () => {
	$('.or-input').append('<label>Orientaion<input class="field" type="text" placeholder="orientation"></label>');
});

$('#el-btn').on('click', () => {
	$('.el-input').append('<label>Elements<input class="field" type="text" placeholder="elements"></label>');
});

$('.submit-btn').on('click', (e) => {
	e.preventDefault();

	const mocks = $('.mock-input input[type=text]');
	const orientation = $('.or-input input[type=text]');
	const elements = $('.el-input input[type=text]');

	data.type = $('.select-type option:selected').val();	// get value for type of work selected
	$('fieldset.input-content input[type=text]').each(setDataGallery);	// get values for data for gallery page
	$('fieldset.data-overview > input[type=text]').each(setOverviewData);	// get values for data for work page
	if ($(mocks).first().val()) {
		detailsData.desc_mocks = [];
		mocks.each(function () {
			detailsData.desc_mocks.push($(this).val());
		});
	} else {
		delete detailsData.desc_mocks;
	}
	if ($(orientation).first().val()) {
		detailsData.desc_orientation = [];
		orientation.each(function () {
			detailsData.desc_orientation.push($(this).val());
		});
	} else {
		delete detailsData.desc_orientation;
	}
	if ($(elements).first().val()) {
		detailsData.desc_elements = [];
		elements.each(function () {
			detailsData.desc_elements.push($(this).val());
		});
	} else {
		delete detailsData.desc_elements;
	}

	writeUserData();
	// resetForm();
});
