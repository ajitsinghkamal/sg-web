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

const data = {
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

let currentActiveSection = 1;

const nameField = $('#data-name');
const imageField = $('#data-image');
const titleField = $('#data-title');
const tagField = $('#data-tag');
const logoField = $('#data-logo');
const introField = $('#data-intro');
const notesField = $('#data-notes');
const headingField = $('#data-heading');
const projectsList = $('.project-list');

function updateListView() {
	projectsList.html('');
	projectsList.append('<option disabled>--- client work ---</option>');
	Object.keys(clientWorkList).forEach(item => projectsList.append(`<option value="${item}">${item}</option>`));
	projectsList.append('<option disabled>--- proactive work ---</option>');
	Object.keys(proWorkList).forEach(item => projectsList.append(`<option value="${item}">${item}</option>`));
}

auth.onAuthStateChanged((user) => {
	if (user) { 	// user signed in
		$('.login').addClass('hide');
		$('.dashboard').removeClass('hide');
		updateListView();
	} else { 		// user signed out
		$('.dashboard').addClass('hide');
		$('.login').removeClass('hide');
	}
});


db.ref('/client/').on('value', (snapshot) => {
	clientWorkList = snapshot.val();
	updateListView();
});
db.ref('/pro/').on('value', (snapshot) => {
	proWorkList = snapshot.val();
	updateListView();
});


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
		alert('success');
		break;
	case 'pro':
		// proWorkList.push(detailsData);
		db.ref(`pro/${data.identifier}`).set(detailsData);
		alert('success');
		break;
	default:
		console.log('invalid');
		break;
	}
}

const resetForm = function resetFormFunc() {
	$('form').find('input[type=text]').val('');
	$('.mock-input').html('');
	$('.or-input').html('');
	$('.el-input').html('');
};

const appendSlides = function appendSlidesHelper() {
	$('.slides-input').append('<label>Slide<input type="text" class="field" placeholder="image for slideshow thumbnail"></label>');
};

const appendMocks = function appendMocksHelper() {
	$('.mock-input').append('<label>Work mocks<input type="text" required class="field" placeholder="mocks"></label>');
};

const appendOrient = function appendOrientHelper() {
	$('.or-input').append('<label>Orientaion<input class="field" type="text" placeholder="orientation"></label>');
};

const appendElements = function appendElementsHelper() {
	$('.el-input').append('<label>Elements<input class="field" type="text" placeholder="elements"></label>');
};
// ============ event handlers =======================

/* ********************************* */
/* ***** handlers for login ******* */
/* ******************************** */
$('#login-form').submit((e) => {
	e.preventDefault();
	authenticate();
});

$('.signout-btn').on('click', () => {
	auth.signOut();
});

/* ******************************* */
/* ** handlers for form section ** */
/* ******************************* */

$('.slides-input--btn').on('click', appendSlides);

$('#mock-btn').on('click', appendMocks);

$('#or-btn').on('click', appendOrient);

$('#el-btn').on('click', appendElements);


$('#data-form').on('submit', (e) => {
	const mocks = $('.mock-input input[type=text]');
	const orientation = $('.or-input input[type=text]');
	const elements = $('.el-input input[type=text]');

	data.type = $('.select-type option:selected').val();	// get value for type of work selected
	$('.data-work input[type=text]').each(setDataGallery);	// get values for data for gallery page
	$('.data-overview > label > input[type=text]').each(setOverviewData);	// get values for data for work page

	// iterate and get entered mock images
	if ($(mocks).first().val()) {
		detailsData.desc_mocks = [];
		mocks.each(function mocksBtnEvent() {
			detailsData.desc_mocks.push($(this).val());
		});
	} else {
		e.preventDefault();
		delete detailsData.desc_mocks;
		return;
	}

	// iterate and get entered images of orientation
	if ($(orientation).first().val()) {
		detailsData.desc_orientation = [];
		orientation.each(function orientationBtnEvent() {
			detailsData.desc_orientation.push($(this).val());
		});
	} else {
		delete detailsData.desc_orientation;
	}

	// iterate and get entered images of used elements
	if ($(elements).first().val()) {
		detailsData.desc_elements = [];
		elements.each(function elementsBtnEvent() {
			detailsData.desc_elements.push($(this).val());
		});
	} else {
		delete detailsData.desc_elements;
	}

	if (data.identifier) {
		// e.preventDefault();
		console.log(detailsData);
		writeUserData();
	}
	// resetForm();
});

// fetch and update form with data for selected project
$('.project-list').change(() => {
	resetForm();

	const val = $('.project-list option:selected').text();
	const projectData = clientWorkList[val] ? clientWorkList[val] : proWorkList[val];

	try {
		nameField.val(val).prop('disabled', true);
		imageField.val(projectData.thumb_image);
		titleField.val(projectData.thumb_title);
		tagField.val(projectData.thumb_tag);
		logoField.val(projectData.desc_logo);
		introField.val(projectData.desc_intro);
		headingField.val(projectData.desc_heading);

		if (projectData.desc_note) {
			notesField.val(projectData.desc_note);
		}

		if (projectData.desc_mocks) {
			projectData.desc_mocks.forEach((mockUrl) => {
				appendMocks();
				$('.mock-input input:last').val(mockUrl);
			});
		}

		if (projectData.desc_orientation) {
			projectData.desc_orientation.forEach((orienUrl) => {
				appendOrient();
				$('.or-input input:last-child').val(orienUrl);
			});
		}

		if (projectData.desc_elements) {
			projectData.desc_elements.forEach((elementUrl) => {
				appendElements();
				$('.el-input input:last-child').val(elementUrl);
			});
		}

		if (projectData.thumb_slide) {
			projectData.thumb_slide.forEach((slideUrl) => {
				appendSlides();
				$('.slides-input input[type=text]:last-child').val(slideUrl);
			});
		}
	} catch (error) {
		console.error(error);
	}
});

// ================= header buttons event lister ==================
$('#update-btn').on('click', function updateBtnEvent() {
	// hide projects dropdown and display work type dropdown
	currentActiveSection = 1;
	$(this).addClass('active');
	$('#new-btn').removeClass('active');
	resetForm();
	$('.select-type').hide();
	$('.project-list').show();
});

$('#new-btn').on('click', function newBtnEvent() {
	// hide work type dropdown and display projects dropdown
	currentActiveSection = 2;
	$(this).addClass('active');
	$('#update-btn').removeClass('active');
	resetForm();
	nameField.prop('disabled', false);
	$('.select-type').show();
	$('.project-list').hide();
});
