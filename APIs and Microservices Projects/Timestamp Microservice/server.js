// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * API endpoint 
 */
const formatDateToJSON = (date) => ({ "unix": date.getTime(), "utc" : date.toUTCString() }); 
const checkIsDate = (date) => date.toUTCString() !== "Invalid Date";
app.get("/api/timestamp/", (req,res) => {
  // no user time string -> create new time
  res.send(formatDateToJSON(new Date()));
});
app.get("/api/timestamp/:date_string", function (req, res) {
  let userInput = req.params.date_string;
  let userDate = new Date(userInput);
  // if not a valid date -> could be UNIX date -> try again with input converted to integer
  if(!checkIsDate(userDate)) userDate = new Date(parseInt(userInput));  
  
  if (!checkIsDate(userDate)) return res.send({"error" : "Invalid Date" });  
  res.send(formatDateToJSON(userDate)); 
});



// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
