let express = require('express');
let router = express.Router();
let formidable = require('formidable'),
    fs = require('fs'),
    converter = require('json-2-csv');

/* GET home page. */
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

      let deviation =
        entries.map(entry => {
          // let degrees = parseInt(entry.slice(5,7)),
          //     minutes = parseInt(entry.slice(7,9)),
          //     seconds = parseInt(entry.slice(9,11)),
          //     incline = degrees + minutes/60 + seconds/3600

          let incline = parseInt(entry.slice(5,8))/100

          return {
            "measured_depth": entry.slice(0,5),
            "incline": incline.toFixed(2),
            "azimuth": entry.slice(8)
          }
        })

      let calculations =
        deviation.map((entry, index) => {
          let prevEntry = deviation[index-1]
          if (typeof prevEntry != 'undefined') {
            let dogLegAngle =
              calculateDogLegAngle(
                parseFloat(prevEntry.incline),
                parseFloat(entry.incline),
                parseFloat(prevEntry.azimuth),
                parseFloat(entry.azimuth)
              )

            return {
              ...entry,
              "dogLegAngleRadians": dogLegAngle,
              "dogLegAngleDegrees": toDegrees(dogLegAngle)
            }
          } else {
            return {
              ...entry,
              "dogLegAngleRadians": 0,
              "dogLegAngleDegrees": 0
            }
          }
        })

      converter.json2csv(calculations, (err, csv) => {
        if (err) throw err;
        res.attachment('mincurve-results.csv');
        res.end(csv);
      })
    })
  })
});

const toRadians = (angle) => angle * (Math.PI / 180)
const toDegrees = (angle) => angle * (180 / Math.PI)
const calculateDogLegAngle = (upperIncline, lowerIncline, upperAzimuth, lowerAzimuth) => {
  return Math.acos(Math.cos(toRadians(lowerIncline - upperIncline)) - (Math.sin(toRadians(upperIncline)) * Math.sin(toRadians(lowerIncline)) * (1 - Math.cos(toRadians(lowerAzimuth - upperAzimuth)))))
}

module.exports = router;
