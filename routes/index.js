let express = require('express');
let router = express.Router();
let formidable = require('formidable'),
    fs = require('fs'),
    converter = require('json-2-csv');

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
              calculateDogLegAngle(
                toRadians(parseFloat(prevEntry.incline)),
                toRadians(parseFloat(entry.incline)),
                toRadians(parseFloat(prevEntry.azimuth)),
                toRadians(parseFloat(entry.azimuth))
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

      let ratioFactor =
        dogLeg.map(entry => {
          return {
            ...entry,
            "ratioFactor": calculateRatioFactor(entry.dogLegAngleRadians)
          }
        })

      let calculations =
        ratioFactor.map((entry, index) => {
          let prevEntry = deviation[index-1]
          if (typeof prevEntry != 'undefined') {
            let north = calculateNorth(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              toRadians(parseFloat(prevEntry.incline)),
              toRadians(parseFloat(entry.incline)),
              toRadians(parseFloat(prevEntry.azimuth)),
              toRadians(parseFloat(entry.azimuth)),
              parseFloat(entry.ratioFactor)
            )

            let east = calculateEast(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              toRadians(parseFloat(prevEntry.incline)),
              toRadians(parseFloat(entry.incline)),
              toRadians(parseFloat(prevEntry.azimuth)),
              toRadians(parseFloat(entry.azimuth)),
              parseFloat(entry.ratioFactor)
            )

            let vertical = calculateVertical(
              parseFloat(prevEntry.depth),
              parseFloat(entry.depth),
              toRadians(parseFloat(prevEntry.incline)),
              toRadians(parseFloat(entry.incline)),
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

const toRadians = (angle) => angle * (Math.PI / 180)
const toDegrees = (angle) => angle * (180 / Math.PI)
const calculateRatioFactor = (angle) => angle == 0 ? 1 : (2 / angle) * Math.tan(angle / 2)
const calculateDogLegAngle = (upperIncline, lowerIncline, upperAzimuth, lowerAzimuth) => {
  return Math.acos(Math.cos(lowerIncline - upperIncline) - (Math.sin(upperIncline) * Math.sin(lowerIncline) * (1 - Math.cos(lowerAzimuth - upperAzimuth))))
}
const calculateNorth = (upperDepth, lowerDepth, upperIncline, lowerIncline, upperAzimuth, lowerAzimuth, ratioFactor) => {
  return ((lowerDepth - upperDepth) / 2) * (Math.sin(upperIncline) * Math.cos(upperAzimuth) + Math.sin(lowerIncline) * Math.cos(lowerAzimuth)) * ratioFactor
}
const calculateEast = (upperDepth, lowerDepth, upperIncline, lowerIncline, upperAzimuth, lowerAzimuth, ratioFactor) => {
  return ((lowerDepth - upperDepth) / 2) * (Math.sin(upperIncline) * Math.sin(upperAzimuth) + Math.sin(lowerIncline) * Math.sin(lowerAzimuth)) * ratioFactor
}
const calculateVertical = (upperDepth, lowerDepth, upperIncline, lowerIncline, ratioFactor) => {
  return ((lowerDepth - upperDepth) / 2) * (Math.cos(upperIncline) + Math.cos(lowerIncline)) * ratioFactor
}

module.exports = router;
