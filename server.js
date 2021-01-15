const fetch = require('node-fetch');

// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Beer = require('./models/beer');

// Connect to the beerlocker MongoDB
mongoose.connect('mongodb://localhost:27017/beerlocker');

// Create our Express application
var app = express();

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

async function createACard(cardName, list, appKey, token){
  var url = 'https://api.trello.com/1/cards?key=' + appKey + '&token=' + token + '&idList=' + list;
  const body = {name: cardName};

  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  });
  const json = await response.json();

  console.log(json);
}

// Initial dummy route for testing
// http://localhost:3000/api
router.get('/', function(req, res) {
  var appKey = 'a085de50cd91279bdc43ebd7e9b58498';
  var token = '0de12f760c168443df8e2ed47bae83ac598c3288d91c3738129cf1fbd93ff078';
  var board_id = '5f8068684437e62f19045e58';
  var lists = [{"id":"6001a8916b8fd0890c43d51d","name":"API TESTING 1"}, {"id":"6001a897f2e1af7834229aaa","name":"API TESTING 2"}];

  createACard('A New Card!', lists[0].id, appKey, token);
  
  res.json({ message: 'Welcome to the testing script', appKey, token, board_id, lists }); 
});

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Insert beer on port ' + port);