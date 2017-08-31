/* eslint-disable import/prefer-default-export */
import $ from 'jquery';
import * as firebase from 'firebase/app';


export function classShuffleUtil(element, classToAdd, classToRemove) {
	if (typeof element === 'string' || element instanceof String) {
		$(element).removeClass(classToRemove).addClass(classToAdd);
	} else {
		element.forEach((el) => {
			$(el).removeClass(classToRemove).addClass(classToAdd);
		});
	}
}

// export class firebaseDb {
// 	fire = firebase.initializeApp({
// 		apiKey: 'AIzaSyDiMtPwt58-NEnR56kTzJ9HddG5IrGuhrE',
// 		authDomain: 'sudeepgandhiweb.firebaseapp.com',
// 		databaseURL: 'https://sudeepgandhiweb.firebaseio.com',
// 		projectId: 'sudeepgandhiweb',
// 	});

// 	fireDatabase = fire.database();

// 	// write to database
// 	const writeToDb = function writeToDbUtil(path, valueObj) {
// 		fireDatabase.ref().set(valueObj);
// 	};

// 	// read from database
// 	const ReadFromDb = function ReadFromDbUtil(path) {
// 		firebase.database().ref(path).once('value').then((snapshot) => {
// 			// something
// 		});
// 	};
// }

