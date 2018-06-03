let express = require('express');
let router = express.Router();
let formidable = require('formidable'),
    fs = require('fs'),
    converter = require('json-2-csv');

let calculator = require('./calculator.js')

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
            "depth": entry.slice(0,5),
            "incline": incline.toFixed(2),
            "azimuth": entry.slice(8)
          }
        })

      let dogLeg =
        deviation.map((entry, index) => {
          let prevEntry = deviation[index-1]
          if (typeof prevEntry != 'undefined') {
            let dogLegAngle =
              calculator.dogLegAngle(
                calculator.toRadians(parseFloat(prevEntry.incline)),
                calculator.toRadians(parseFloat(entry.incline)),
                calculator.toRadians(parseFloat(prevEntry.azimuth)),
                calculator.toRadians(parseFloat(entry.azimuth))
              )

            return {
              ...entry,
              "dogLegAngleRadians": dogLegAngle,
              "dogLegAngleDegrees": calculator.toDegrees(dogLegAngle)
            }
          } else {
            return {
              ...entry,
              "dogLegAngleRadians": 0,
              "dogLegAngleDegrees": 0
            }
          }
        })

      let ratioFactor =
        dogLeg.map(entry => {
          return {
            ...entry,
            "ratioFactor": calculator.ratioFactor(entry.dogLegAngleRadians)
          }
        })

      let calculations =
        ratioFactor.map((entry, index) => {
          let prevEntry = deviation[index-1]
          if (typeof prevEntry != 'undefined') {
            let north = calculator.north(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              calculator.toRadians(parseFloat(prevEntry.incline)),
              calculator.toRadians(parseFloat(entry.incline)),
              calculator.toRadians(parseFloat(prevEntry.azimuth)),
              calculator.toRadians(parseFloat(entry.azimuth)),
              parseFloat(entry.ratioFactor)
            )

            let east = calculator.east(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              calculator.toRadians(parseFloat(prevEntry.incline)),
              calculator.toRadians(parseFloat(entry.incline)),
              calculator.toRadians(parseFloat(prevEntry.azimuth)),
              calculator.toRadians(parseFloat(entry.azimuth)),
              parseFloat(entry.ratioFactor)
            )

            let vertical = calculator.vertical(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              calculator.toRadians(parseFloat(prevEntry.incline)),
              calculator.toRadians(parseFloat(entry.incline)),
              parseFloat(entry.ratioFactor)
            )

            return {
              ...entry,
              "north": north,
              "east": east,
              "vertical": vertical
            }
          } else {
            return {
              ...entry,
              "north": 0,
              "east": 0,
              "vertical": 0
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

module.exports = router;
