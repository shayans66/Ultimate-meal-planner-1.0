

// Fires off when the document is loading and code is ready to be run!
$(document).ready(function(){

	// Let the magic begin.
	firebase.database().ref().set({
		fact: "Dogs are cool!!!!!1."
	});
});

