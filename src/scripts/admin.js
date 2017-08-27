$(document).ready(() => {
	const app = firebase.auth();
	const data = {
		user: null,
		loggedIn: false,
		sectionWork: false,
		sectionDetail: false,
	};

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
					// signed in
					console.log('scucess');
					app.onAuthStateChanged((u) => {
						data.loggedIn = true;
						data.user = u;
						$('#login-form').hide();
						console.log(data);
					});
				} else {
					// signed out
					data.loggedIn = false;
				}
			});
	};

	$('#login-form').submit((e) => {
		e.preventDefault();
		authenticate();
	});

});
