export var Solar = {

// https://github.com/LocusEnergy/solar-calculations/blob/master/src/main/java/com/locusenergy/solarcalculations/SolarCalculations.java

calcJulianDate: function(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month <= 2) {
    year--;
    month += 12;
  }
  
  var a = Math.floor(year / 100);
  var b = 2 - a + Math.floor(a/4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
},

calcTimeDecimal: function(date) {
  return date.getHours() + date.getMinutes()/60 + date.getSeconds()/3600;
},

getOffset: function(date) {
  // UTC -> JST
  return (9 * 60 * 60 * 1000) / 3600000; // msec
},

// assumes datetime given in local time
calcTimeJulian: function(date) {
  var jd = this.calcJulianDate(date);
  var time = this.calcTimeDecimal(date);
  var offset = this.getOffset(date);
  return (jd + (time - offset)/24 - 2451545) / 36525;
},

calcMeanObliquityOfEcliptic: function(timeJulian) {
  var seconds = 21.448 - timeJulian * (46.8150 + timeJulian * (0.00059 - timeJulian * (0.001813)));
  return 23 + (26 + seconds/60)/60;
},

calcObliquityCorrection: function(timeJulian) {
  var e0 = this.calcMeanObliquityOfEcliptic(timeJulian);
  var omega = 125.04 - 1934.136 * timeJulian;
  return e0 + 0.00256 * Math.cos(PIXY.radians(omega));
},

calcGeomMeanLongSun: function(timeJulian) {
  var output = 280.46646 + timeJulian * (36000.76983 + 0.0003032 * timeJulian);
  while (output > 360) output -= 360;
  while (output < 0) output += 360;
  return output;
},

calcGeomMeanAnomalySun: function(timeJulian) {
  return 357.52911 + timeJulian * (35999.05029 - 0.0001537 * timeJulian);
},

calcEccentricityEarthOrbit: function(timeJulian) {
  return 0.016708634 - timeJulian * (0.000042037 + 0.0000001267 * timeJulian);
},

calcSunEqOfCenter: function(timeJulian) {
  var m = this.calcGeomMeanAnomalySun(timeJulian);
  return Math.sin(PIXY.radians(m)) * (1.914602 - timeJulian * (0.004817 + 0.000014 * timeJulian)) + Math.sin(PIXY.radians(m*2)) * (0.019993 - 0.000101 * timeJulian) + Math.sin(PIXY.radians(m*3)) * 0.000289;
},

calcSunTrueLong: function(timeJulian) {
  return this.calcGeomMeanLongSun(timeJulian) + this.calcSunEqOfCenter(timeJulian);
},

calcSunApparentLong: function(timeJulian) {
  var o = this.calcSunTrueLong(timeJulian);
  var omega = 125.04 - 1934.136 * timeJulian;
  return o - 0.00569 - 0.00478 * Math.sin(PIXY.radians(omega));
},

calcSolarDeclination: function(date) {
  var timeJulian = this.calcTimeJulian(date);
  var e = this.calcObliquityCorrection(timeJulian);
  var lambda = this.calcSunApparentLong(timeJulian);
  var sint = Math.sin(PIXY.radians(e)) * Math.sin(PIXY.radians(lambda));
  return PIXY.degrees(Math.asin(sint));
},

calcEquationOfTime: function(date) {
  var timeJulian = this.calcTimeJulian(date);
  var epsilon = this.calcObliquityCorrection(timeJulian);
  var l0 = this.calcGeomMeanLongSun(timeJulian);
  var e = this.calcEccentricityEarthOrbit(timeJulian);
  var m = this.calcGeomMeanAnomalySun(timeJulian);
  var y = PIXY.pow2(Math.tan(PIXY.radians(epsilon/2)));
  var sin2l0 = Math.sin(PIXY.radians(2*l0));
  var sinm = Math.sin(PIXY.radians(m));
  var cos2l0 = Math.cos(PIXY.radians(2*l0));
  var sin4l0 = Math.sin(PIXY.radians(4*l0));
  var sin2m = Math.sin(PIXY.radians(2*m));
  var eqTime = y*sin2l0 - 2*e*sinm + 4*e*y*sinm*cos2l0 - 0.5*y*y*sin4l0 - 1.25*e*e*sin2m;
  return PIXY.degrees(eqTime)*4;
},

calcTrueSolarTime: function(date, longitude) {
  var eqTime = this.calcEquationOfTime(date);
  var time = this.calcTimeDecimal(date);
  var offset = this.getOffset(date);
  var solarTimeFix = eqTime + 4 * longitude - 60*offset;
  var trueSolarTime = time*60 + solarTimeFix;
  while (trueSolarTime > 1440) trueSolarTime -= 1440;
  return trueSolarTime;
},

calcHourAngle: function(date, longitude) {
  var trueSolarTime = this.calcTrueSolarTime(date, longitude);
  var hourAngle = trueSolarTime / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;
  return hourAngle;
},

calcSolarZenith: function(date, latitude, longitude, refraction) {
  var solarDeclination = this.calcSolarDeclination(date);
  var hourAngle = this.calcHourAngle(date, longitude);
  
  var solarDeclinationSin = Math.sin(PIXY.radians(solarDeclination));
  var solarDeclinationCos = Math.cos(PIXY.radians(solarDeclination));
  var latitudeSin = Math.sin(PIXY.radians(latitude));
  var latitudeCos = Math.cos(PIXY.radians(latitude));
  var hourAngleCos = Math.cos(PIXY.radians(hourAngle));
  
  var csz = latitudeSin * solarDeclinationSin + latitudeCos * solarDeclinationCos * hourAngleCos;
  var solarZenith = PIXY.degrees(Math.acos(csz));
  
  if (refraction) {
    var solarElevation = 90 - solarZenith;
    var refractionCorrection = 0;
    var te = Math.tan(PIXY.radians(solarElevation));
    if (solarElevation <= 85 && solarElevation > 5) {
      refractionCorrection = 58.1 / te - 0.07 / Math.pow(te, 3) + 0.000086 / Math.pow(te, 5);
    }
    else if (solarElevation <= 85 && solarElevation > -0.575) {
      refractionCorrection = 1735 + solarElevation*(-518.2 + solarElevation*(103.4 + solarElevation*(-12.79 + solarElevation*0.711)));
    }
    else {
      refractionCorrection = -20.774/te;
    }
    
    solarZenith -= refractionCorrection;
  }
  
  return solarZenith;
},

calcSolarAzimuth: function(date, latitude, longitude) {
  var solarDeclination = this.calcSolarDeclination(date);
  var hourAngle = this.calcHourAngle(date, longitude);
  var solarZenith = this.calcSolarZenith(date, latitude, longitude, false);
  
  var hourAngleSign = Math.sign(hourAngle);
  var solarZenithSin = Math.sin(PIXY.radians(solarZenith));
  var solarZenithCos = Math.cos(PIXY.radians(solarZenith));
  var latitudeSin = Math.sin(PIXY.radians(latitude));
  var latitudeCos = Math.cos(PIXY.radians(latitude));
  
  var output = Math.acos((solarZenithCos * latitudeSin - Math.sin(PIXY.radians(solarDeclination))) / (solarZenithSin * latitudeCos));
  var output = PIXY.degrees(output);
  if (hourAngle > 0) {
    return (output + 180) % 360;
  }
  else {
    return (540 - output) % 360;
  }
},

calcSolarAltitude: function(date, latitude, longitude) {
  return 90 - this.calcSolarZenith(date, latitude, longitude);
},

calcAirMass: function(date, latitude, longitude) {
  var solarZenith = this.calcSolarZenith(date, latitude, longitude);
  if (solarZenith < 90) {
    var rad = PIXY.radians(solarZenith);
    var a = 1.002432 * Math.pow(Math.cos(rad), 2.0);
    var b = 0.148386 * Math.cos(rad);
    var X = a + b + 0.0096467;
    var c = Math.pow(Math.cos(rad), 3.0);
    var d = 0.149864 * Math.pow(Math.cos(rad), 2.0);
    var e = 0.0102963 * Math.cos(rad);
    var Y = c + d + e + 0.000303978;
    return X / Y;
  }
  else {
    return 0;
  }
},

calcExtraIrradiance: function(date) {
  var start = new Date(date.getFullYear(), 0, 0);
  var diff = date.getTime() - start.getTime();
  var oneDay = 1000 * 60 * 60 * 24;
  // var day = Math.ceil(diff / oneDay);
  // var day = Math.floor(diff / oneDay);
  var day = diff / oneDay;
  
  // 1367 = accepted solar constant [W/m^2]
  return 1367 * (1.0 + Math.cos(PIXY.radians(360 * day / 365)) / 30);
},

calcSolarAttenuation: function(theta, turbitity) {
  var beta = 0.04608365822050 * turbitity - 0.04586025928522;
  var tauR, tauA;
  var tau = [0.0,0.0,0.0];
  var tmp = 93.885 - theta / Math.PI * 180.0;
  if (tmp < 0) {
    return tau;
  }
  var m = 1.0 / (Math.cos(theta) + 0.15 * Math.pow(93.885 - theta / Math.PI * 180.0, -1.253)); // Relative Optical Mass
  var lambda = [0.65, 0.57, 0.475];
  for (var i=0; i<3; i++) {
    // Rayleigh Scattering
    // lambda in um
    tauR = Math.exp(-m * 0.008735 * Math.pow(lambda[i], -4.08));
    
    // Aerosal (water + dust) attenuation
    // beta - amount of aerosols present
    // alpha - ratio of small to large particle sizes. (0:4, usually 1.3)
    var alpha = 1.3;
    tauA = Math.exp(-m * beta * Math.pow(lambda[i], -alpha)); // lambda should be in um
    
    tau[i] = tauR * tauA;
  }
  
  return tau;
}

};
