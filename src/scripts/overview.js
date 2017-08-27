const source = $('#template').html();
const template = Handlebars.compile(source);

let APItoHit = 'https://sudeepgandhiweb.firebaseio.com/descriptions.json';

const getUrlParameter = function getUrlParameter(sParam) {
	const sPageURL = decodeURIComponent(window.location.search.substring(1));
	const sURLVariables = sPageURL.split('&');
	let sParameterName;

	for (let i = 0; i < sURLVariables.length; i += 1) {
		sParameterName = sURLVariables[i].split('=');

		if (sParameterName[0] === sParam) {
			return sParameterName[1] === undefined ? true : sParameterName[1];
		}
	}
};


$.get(APItoHit, (response) => {
	console.log(response);
})
	.done((response) => {
		const data = response.indraneel;
		$('#content-placeholder').html(template(data));
	})
	.fail((error) => {
		console.error(error.message);
	});
