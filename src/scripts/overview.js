import 'firebase/database';

import $ from 'jquery';
import Handlebars from 'handlebars';
import lazySizes from 'lazysizes';

import CommonUtil from './app';

const fire = new CommonUtil();
const db = fire.fireInstance.database();

const source = $('#template').html();
const template = Handlebars.compile(source);

function getUrlParameter(paramToGet) {
	const qString = decodeURIComponent(window.location.search.substring(1));
	const urlVariables = qString.split('&');
	let paramName;
	for (let i = 0; i < urlVariables.length; i += 1) {
		paramName = urlVariables[i].split('=');

		if (paramName[0] === paramToGet) {
			return paramName[1] === undefined ? true : paramName[1];
		}
	}
	return undefined;
}


function initPageContent() {
	const key = getUrlParameter('work');

	db.ref('/').on('value', (snapshot) => {
		if (snapshot.child(`client/${key}`).exists()) {
			const data = snapshot.child(`client/${key}`).val();
			$('#content-placeholder').html(template(data));
		} else if (snapshot.child(`pro/${key}`).exists()) {
			const data = snapshot.child(`pro/${key}`).val();
			$('#content-placeholder').html(template(data));
		} else {
			window.location.href = '404.html';
		}
	});
}

initPageContent();
CommonUtil.initiateOffNav();

