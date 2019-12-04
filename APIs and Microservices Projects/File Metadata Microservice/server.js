'use strict';

var express = require('express');
var cors = require('cors');

// require and use "multer"...

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });



// API here

const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {fileSize: 10000000, files: 1}, // limit file size to 10 MB
}).single('upfile');
app.route('/api/fileanalyse').post((req, res) => {
  upload(req, res, err => {
    // check for errors
    if (err) {
      console.log(err);
      if (err instanceof multer.MulterError) {
        return res.send('A Multer error occurred when uploading. --> ' + err);
      } else if (err) {
        return res.send('An unknown error occurred when uploading. --> ' + err);
      }
    } 
    
    // Everything went fine.
    let name = req.file.originalname,
    size = req.file.size,
    type = req.file.mimetype;
    res.send({"name": name,"type": type,"size": size});
    console.log('file uploaded:')
    console.log(req.file);    
  });
});


app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});

