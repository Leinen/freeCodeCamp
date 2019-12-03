'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
//Mount the body-parser middleware  here
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
// url exists
// use await and async - https://stackoverflow.com/questions/26007187/node-js-check-if-a-remote-url-exists
const util = require('util');
const urlExists = util.promisify(require('url-exists'));

// url container
let urls = [];

// your first API endpoint... 
app.route("/api/shorturl/new").post(async (req, res) => {
  let url = req.body.url;
  let isExists = await urlExists(url);  
  if (!isExists) return res.send({"error":"invalid URL"});  
  
  // shorten url and send response
  let index = urls.findIndex(item => item.original_url === url);
  if(index !== -1) return res.send(urls[index]);
  let obj = {original_url: url, short_url: urls.length}
  urls.push(obj);
  res.send(obj);  
  console.log(urls)
});

// shorturl endpoint
app.route("/api/shorturl/:short").get((req, res) => {
  let short_url = parseInt(req.params.short)
  let index = urls.findIndex(item => item.short_url === short_url);
  if (index === -1) return res.send({"error":"invalid short-URL"});
  res.redirect(urls[index].original_url);
  // console.log(urls[index].original_url)
  // console.log(index)  
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});
