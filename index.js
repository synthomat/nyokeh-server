var express = require('express'),
    uuid = require('node-uuid'),
    multer  = require('multer'),
    path = require('path');

var URL = "http://localhost:3000/";

var storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    cb(null, uuid.v4().substr(0,8) +  ext);
  }
});

var upload = multer({ storage: storage });

var allow = [
    "f5f92673ec36e5f0055ae3dcbb8da4457a16a6f9"
];

var app = express();
app.use(express.static('uploads'));

app.get('/', function (req, res) {
  res.json({});
});

var checkKey = function(key) {
  return allow.indexOf(key) >= 0;
};

app.get('/check', function(req, res) {
  var key = req.query.auth || '';

  if (checkKey(key)) {
    res.json({auth: "valid"});
  } else {
    res.status(401).json({auth: "invalid"});
  }
});

var permission = function(req, res, next) {
  var key = req.query.auth || '';
  if (checkKey(key)) {
    return next();
  } else {
    res.status(401).json({error: "not authorized"});
  }
};

app.post('/upload', [permission, upload.single('file')], function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  res.status(201).json({
    filename: req.file.filename,
    url: URL + req.file.filename
  });
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
