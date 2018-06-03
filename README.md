# MinCurve
Small app to [calculate Minimum Curvature](http://www.drillingformulas.com/minimum-curvature-method/)

### Usage
From the project directory:
```
$ npm install
$ npm start
```

- navigate to http://localhost:3000
- select text file with valid MMS format
- each line will get parsed as such:
	- [0-4]: measured depth
	- [5-6]: incline degrees
	- [7-8]: incline minutes
	- [9-10]: incline seconds
	- [11-17]: azimuth
- a csv file will be generated with the minimum curve calculations

#### Example
`00113010148235.94` will be parsed to these values:
- measured depth: `113`
- incline degrees: `1`
- incline minutes: `1`
- incline seconds: `48`
- azimuth: `235.94`

inclination will be computed to `1.03`
