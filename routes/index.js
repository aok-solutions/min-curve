var express = require('express');
var router = express.Router();
var formidable = require('formidable'),
    fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Calculate Minimum Curvature' });
});

router.post('/fileupload', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    fs.readFile(files.file.path, function (err, data) {
      res.end(data);
    })
  })
});

module.exports = router;
