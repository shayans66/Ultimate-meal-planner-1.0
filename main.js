

// Fires off when the document is loading and code is ready to be run!
$(document).ready(function(){

	// Let the magic begin.
	
	var database = firebase.database();
	var foodField = document.getElementById('food-field');

	$('#save-button').click(function(){
		var food = foodField.value;
		console.log(food);
		database.ref('food/').push(food).then(function(){
			console.log('Finisehd Pushing.')
		});
	});
});

