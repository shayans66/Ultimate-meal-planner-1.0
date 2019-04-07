// $(document).ready(function() {
// 	var database = firebase.database();
// 	var foodField = document.getElementById('food-field');
//
// 	// $('#save-button').click(function(){
// 	// 	var food = foodField.value;
// 	// 	console.log(food);
// 	// 	database.ref('food/').push(food).then(function(){
// 	// 		console.log('Finished Pushing.')
// 	// 	});
// 	// });
// });

const express = require('express');
const bodyParser = require("body-parser");
const axios = require('axios');

const API_KEY = 'XUVPTddV3TNR8Bts0DR9JyY7Zftxiv7OgPa8OFsb'

const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('static'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.render('index.pug')
});

app.post('/', function (req, res) {
    let description;
    axios.get('https://api.nal.usda.gov/ndb/search/', {
        params: {
            api_key: API_KEY,
            q: req.body.food[0],
            max: 1,
            ds: 'Standard Reference'
        }
    }).then(function (response) {
        axios.get('https://api.nal.usda.gov/ndb/V2/reports', {
            params: {
                api_key: API_KEY,
                ndbno: response.data.list.item[0].ndbno
            }
        }).then(function (response) {
            description = response.data.foods[0].food;
            res.render('index.pug', {food: description});
        }).catch(function (response) {
            console.error(response);
            res.render('index.pug');
        });
    }).catch(function (response) {
        console.error(response);
        res.render('index.pug');
    });
});

app.listen(port, () => console.log(`Listening on port ${port}.`));

