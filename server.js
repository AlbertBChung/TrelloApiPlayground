const fetch = require('node-fetch');
const Instagram = require('instagram-web-api');
const FileCookieStore = require('tough-cookie-filestore2')

// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var Beer = require('./models/beer');
var cors = require('cors')

// Connect to the beerlocker MongoDB
mongoose.connect('mongodb://localhost:27017/beerlocker');

// Create our Express application
var app = express();
app.use(cors())

// Use the body-parser package in our application
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use environment defined port or 3000
var port = process.env.PORT || 3000;

// Create our Express router
var router = express.Router();

// create a card function. Use this as a template.
async function createACard(cardName, list, appKey, token) {
  // a string concatenation for the url
  var url = 'https://api.trello.com/1/cards?key=' + appKey + '&token=' + token;
  
  // body is an object that contains the parameters to specify characteristics of the new card!
  const body = {
    name: cardName, 
    idList: list,
    due: new Date()
  };

  const response = await fetch(url, {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  });
  const cardData = await response.json();

  // this prints the new card's id in your terminal. This is useful if you want to do more (other API requests) with
  // the card later.
  console.log('New Card Created!!\n\nHere is the new card\'s id!', cardData.id);
}

function setupTrello() {
  //below is the specific ids needed for the POST request
  var appKey = 'a085de50cd91279bdc43ebd7e9b58498';
  var token = '0de12f760c168443df8e2ed47bae83ac598c3288d91c3738129cf1fbd93ff078';
  var board_id = '5f8068684437e62f19045e58';
  var lists = [{"id":"6001a8916b8fd0890c43d51d","name":"API TESTING 1"}, {"id":"6001a897f2e1af7834229aaa","name":"API TESTING 2"}];

  //method that creates a card
  createACard('The newest Card', lists[0].id, appKey, token);
}

function getImages(photosPayload){
  return photosPayload.user.edge_owner_to_timeline_media.edges;
}

// This function returns a list of length 5 of photo urls of Ed Sheeran
async function setupInstagram(){
  //Login Info
  const username = 'lhs_extern_acc'
  const password = 'NodeJS1!'

  const cookieStore = new FileCookieStore('./cookies.json')
  const client = new Instagram({ username, password, cookieStore })
 
  //Ed Sheeran's instagram
  const edSheeranUsername = 'teddysphotos';
  // number of photos
  const first = 5;

  //fetch images using api
  const photos = await client.getPhotosByUsername({ username: edSheeranUsername, first: first })

  //convert images to usable array
  const photoArray = getImages(photos);
  
  //printing array
  // console.log(photoArray);
  // console.log(photoArray[3].node.display_url);
  const urlArray = [];
  var i;
  for (i = 0; i < photoArray.length; i++) {
    urlArray.push(photoArray[i].node.display_url);
  }

  return urlArray;
  //TODO: This is a sample route localhost:3000/api that prints a set of 5 images from ed sheeran's instagram
  // create GET routes for each of the following:
  // 1. returns timestamps in a json
  // 2. returns display urls (photos) in a json
  // 3. returns misc infos like is_video, dimensions, etc
  // work off the examples of the tutorial to create these routes! 
  // It could be localhost:3000/api/edsheeran/ or something similar
  // make sure to run npm install and test that the program is printing stuff out by going to
  //localhost:3000/api
  
}


// Create a new ROUTE accessable through /api/instagram
const instagramRoute = router.route('/instagram/edsheerantopfivephotourls');

// Create a new ENDPOINT for GETs
instagramRoute.get(async function(req, res) {
  const photoArray = await setupInstagram();  
  const responseObject = {
    photos: photoArray
  };
  res.json(responseObject);
});

// Initial dummy route for testing
// http://localhost:3000/api
router.get('/', function(req, res) {
  setupInstagram();  
  res.json({ message: 'Welcome to the testing script' }); 
});

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(port);
console.log('Insert beer on port ' + port);