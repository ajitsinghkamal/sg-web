/* eslint-disable import/prefer-default-export */
import $ from 'jquery';
import * as firebase from 'firebase/app';


export default class CommonUtil {
	constructor() {
		this.fireInstance = firebase.initializeApp({
			apiKey: 'AIzaSyDiMtPwt58-NEnR56kTzJ9HddG5IrGuhrE',
			authDomain: 'sudeepgandhiweb.firebaseapp.com',
			databaseURL: 'https://sudeepgandhiweb.firebaseio.com',
			projectId: 'sudeepgandhiweb',
		});
	}

	static initiateOffNav() {
		$('input[type=checkbox]').change(function checkListener() {
			if ($(this).is(':checked')) {
				$('body').addClass('off-nav--opened');
			} else {
				// Checkbox is not checked..
				$('body').removeClass('off-nav--opened');
			}
		});
	}
}

