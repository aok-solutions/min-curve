let express = require('express');
let router = express.Router();
let formidable = require('formidable'),
    fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Calculate Minimum Curvature' });
});

router.post('/fileupload', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    res.writeHead(200, {'content-type': 'text/plain'});
    fs.readFile(files.file.path, function (err, data) {
      const regex = /([0-9]{14}.[0-9]{2})/
      let entries =
        data
          .toString()
          .split('\n')
          .map(entry => entry.trim())
          .filter(entry => entry.match(regex))

      res.end(entries.join("\n"));
    })
  })
});

module.exports = router;
