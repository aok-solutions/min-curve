module.exports = {
  toRadians : (angle) => angle * (Math.PI / 180),
  toDegrees : (angle) => angle * (180 / Math.PI),
  ratioFactor : (angle) => angle == 0 ? 1 : (2 / angle) * Math.tan(angle / 2),
  dogLegAngle : (upperIncline, lowerIncline, upperAzimuth, lowerAzimuth) => {
    return Math.acos(Math.cos(lowerIncline - upperIncline) - (Math.sin(upperIncline) * Math.sin(lowerIncline) * (1 - Math.cos(lowerAzimuth - upperAzimuth))))
  },
  north : (upperDepth, lowerDepth, upperIncline, lowerIncline, upperAzimuth, lowerAzimuth, ratioFactor) => {
    return ((lowerDepth - upperDepth) / 2) * (Math.sin(upperIncline) * Math.cos(upperAzimuth) + Math.sin(lowerIncline) * Math.cos(lowerAzimuth)) * ratioFactor
  },
  east : (upperDepth, lowerDepth, upperIncline, lowerIncline, upperAzimuth, lowerAzimuth, ratioFactor) => {
    return ((lowerDepth - upperDepth) / 2) * (Math.sin(upperIncline) * Math.sin(upperAzimuth) + Math.sin(lowerIncline) * Math.sin(lowerAzimuth)) * ratioFactor
  },
  vertical : (upperDepth, lowerDepth, upperIncline, lowerIncline, ratioFactor) => {
    return ((lowerDepth - upperDepth) / 2) * (Math.cos(upperIncline) + Math.cos(lowerIncline)) * ratioFactor
  }
}
