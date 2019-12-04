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
const upload = multer({ storage: storage });
app.route('/api/fileanalyse').post(upload.single('upfile'), (req, res) => {
  let name = req.file.originalname,
      size = req.file.size,
      type = req.file.mimetype;
  res.send({"name": name,"type": type,"size": size});
  console.log('file uploaded:')
  console.log(req.file);
});

// check for errors
app.post('/api/fileanalyse', function (req, res) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send('A Multer error occurred when uploading.')
    } else if (err) {
      res.send('An unknown error occurred when uploading.')
    }
 
    // Everything went fine.
  })
})


app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});

