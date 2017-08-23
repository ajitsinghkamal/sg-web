$(document).ready(() => {
	const app = firebase.auth();
	const source = $('#template').html();
	const template = Handlebars.compile(source);

	/**
	 * authenticates user for firebase access
	 * 
	 */
	const authenticate = function authenticateCreds() {
		const email = $('#email').val();
		const password = $('#password').val();

		app.signInWithEmailAndPassword(email, password)
			.catch((error) => {
				console.error(error.message);
			})
			.then((user) => {
				if (user) {
					app.onAuthStateChanged((user) => {

					});
				}
			});
	};

	$('#login-form').submit((e) => {
		e.preventDefault();
		authenticate();
	});

});
