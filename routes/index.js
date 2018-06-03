let express = require('express');
let router = express.Router();
let formidable = require('formidable'),
    fs = require('fs'),
    converter = require('json-2-csv');

let calculate = require('./calculator.js');
let transform = require('./transformer.js');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Calculate Minimum Curvature' });
});

router.post('/fileupload', function(req, res, next) {
  let form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    fs.readFile(files.file.path, function (err, data) {
      // const regex = /([0-9]{14}.[0-9]{2})/
      const regex = /([0-9]{11}.[0-9]{2})/
      let entries =
        data
          .toString()
          .split('\n')
          .map(entry => entry.trim())
          .filter(entry => entry.match(regex))

      let calculations =
        entries
          .map(transform.deviation)
          .map(transform.dogLegAngle)
          .map(transform.ratioFactor)
          .map(transform.curveCalculations)

      converter.json2csv(calculations, (err, csv) => {
        if (err) throw err;
        res.attachment('mincurve-results.csv');
        res.end(csv);
      })
    })
  })
});

module.exports = router;
