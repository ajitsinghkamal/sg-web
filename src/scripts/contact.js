import $ from 'jquery';
// import * as firebase from 'firebase/app';
import 'firebase/database';
import CommonUtil from './app';

const fire = new CommonUtil();
const db = fire.fireInstance.database();

/**
 * save message in the database
 * @param {string} name 
 * @param {string} email 
 * @param {string} message 
 */
const saveMessage = function saveMessageDb(mesgLoad) {
	const mesgRef = db.ref('messages').push();
	mesgRef.set(mesgLoad);
};

$('form#message').on('submit', (e) => {
	e.preventDefault();
	const name = $('#name').val();
	const email = $('#email').val();
	const message = $('#mesg').val();
	const mesgLoad = { name, email, message };
	saveMessage({ name, email, message });
	mesgLoad._subject = `${name} left a message for you on your website`;
	mesgLoad._replyto = email;

	$.ajax({
		url: 'https://formspree.io/sudeepwebsite@gmail.com',
		type: 'POST',
		dataType: 'json',
		data: mesgLoad,
		success() {
			$('form#message')[0].reset();
			console.log('sent mail');
		},
	});
});

CommonUtil.initiateOffNav();

