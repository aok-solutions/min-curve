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

      let deviation =
        entries.map(entry => {
          let degrees = parseInt(entry.slice(5,7)),
              minutes = parseInt(entry.slice(7,9)),
              seconds = parseInt(entry.slice(9,11)),
              inclination = degrees + minutes/60 + seconds/3600

          return {
            "measured_depth": entry.slice(0,5),
            "inclination": inclination.toFixed(2),
            "azimuth": entry.slice(11)
          }
        })

      res.end(deviation.map(entry => JSON.stringify(entry)).join("\n"));
    })
  })
});

module.exports = router;
