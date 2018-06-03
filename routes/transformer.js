let calculate = require('./calculator.js');

module.exports = {
  deviation : (entry) => {
    let degrees = parseInt(entry.slice(5,7)),
        minutes = parseInt(entry.slice(7,9)),
        seconds = parseInt(entry.slice(9,11)),
        incline = degrees + minutes/60 + seconds/3600

    return {
      "depth": entry.slice(0,5),
      "incline": incline.toFixed(2),
      "azimuth": entry.slice(11)
    }
  },

  dogLegAngle : (entry, index, data) => {
    let prevEntry = data[index-1]
    if (typeof prevEntry != 'undefined') {
      let dogLegAngle =
        calculate.dogLegAngle(
          calculate.toRadians(parseFloat(prevEntry.incline)),
          calculate.toRadians(parseFloat(entry.incline)),
          calculate.toRadians(parseFloat(prevEntry.azimuth)),
          calculate.toRadians(parseFloat(entry.azimuth))
        )

      return {
        ...entry,
        "dogLegAngleRadians": dogLegAngle,
        "dogLegAngleDegrees": calculate.toDegrees(dogLegAngle)
      }
    } else {
      return {
        ...entry,
        "dogLegAngleRadians": 0,
        "dogLegAngleDegrees": 0
      }
    }
  },

  ratioFactor : (entry) => {
    return {
      ...entry,
      "ratioFactor": calculate.ratioFactor(entry.dogLegAngleRadians)
    }
  },

  curveCalculations : (entry, index, data) => {
    let prevEntry = data[index-1]
    if (typeof prevEntry != 'undefined') {
      let north = calculate.north(
        parseFloat(prevEntry.depth),
        parseFloat(entry.depth),
        calculate.toRadians(parseFloat(prevEntry.incline)),
        calculate.toRadians(parseFloat(entry.incline)),
        calculate.toRadians(parseFloat(prevEntry.azimuth)),
        calculate.toRadians(parseFloat(entry.azimuth)),
        parseFloat(entry.ratioFactor)
      )

      let east = calculate.east(
        parseFloat(prevEntry.depth),
        parseFloat(entry.depth),
        calculate.toRadians(parseFloat(prevEntry.incline)),
        calculate.toRadians(parseFloat(entry.incline)),
        calculate.toRadians(parseFloat(prevEntry.azimuth)),
        calculate.toRadians(parseFloat(entry.azimuth)),
        parseFloat(entry.ratioFactor)
      )

      let vertical = calculate.vertical(
        parseFloat(prevEntry.depth),
        parseFloat(entry.depth),
        calculate.toRadians(parseFloat(prevEntry.incline)),
        calculate.toRadians(parseFloat(entry.incline)),
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
  }
}
