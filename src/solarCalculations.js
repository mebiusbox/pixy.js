import { radians, degrees, pow2 } from './utils.js';

export const Solar = {
	// https://github.com/LocusEnergy/solar-calculations/blob/master/src/main/java/com/locusenergy/solarcalculations/SolarCalculations.java

	calcJulianDate: function ( date ) {

		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		const day = date.getDate();
		if ( month <= 2 ) {

			year--;
			month += 12;

		}

		const a = Math.floor( year / 100 );
		const b = 2 - a + Math.floor( a / 4 );
		return (
			Math.floor( 365.25 * ( year + 4716 ) ) +
			Math.floor( 30.6001 * ( month + 1 ) ) +
			day +
			b -
			1524.5
		);

	},

	calcTimeDecimal: function ( date ) {

		return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

	},

	getOffset: function ( _date ) {

		// UTC -> JST
		return ( 9 * 60 * 60 * 1000 ) / 3600000; // msec

	},

	// assumes datetime given in local time
	calcTimeJulian: function ( date ) {

		const jd = this.calcJulianDate( date );
		const time = this.calcTimeDecimal( date );
		const offset = this.getOffset( date );
		return ( jd + ( time - offset ) / 24 - 2451545 ) / 36525;

	},

	calcMeanObliquityOfEcliptic: function ( timeJulian ) {

		const seconds =
			21.448 -
			timeJulian * ( 46.815 + timeJulian * ( 0.00059 - timeJulian * 0.001813 ) );
		return 23 + ( 26 + seconds / 60 ) / 60;

	},

	calcObliquityCorrection: function ( timeJulian ) {

		const e0 = this.calcMeanObliquityOfEcliptic( timeJulian );
		const omega = 125.04 - 1934.136 * timeJulian;
		return e0 + 0.00256 * Math.cos( radians( omega ) );

	},

	calcGeomMeanLongSun: function ( timeJulian ) {

		let output =
			280.46646 + timeJulian * ( 36000.76983 + 0.0003032 * timeJulian );
		while ( output > 360 ) output -= 360;
		while ( output < 0 ) output += 360;
		return output;

	},

	calcGeomMeanAnomalySun: function ( timeJulian ) {

		return 357.52911 + timeJulian * ( 35999.05029 - 0.0001537 * timeJulian );

	},

	calcEccentricityEarthOrbit: function ( timeJulian ) {

		return 0.016708634 - timeJulian * ( 0.000042037 + 0.0000001267 * timeJulian );

	},

	calcSunEqOfCenter: function ( timeJulian ) {

		const m = this.calcGeomMeanAnomalySun( timeJulian );
		return (
			Math.sin( radians( m ) ) *
				( 1.914602 - timeJulian * ( 0.004817 + 0.000014 * timeJulian ) ) +
			Math.sin( radians( m * 2 ) ) * ( 0.019993 - 0.000101 * timeJulian ) +
			Math.sin( radians( m * 3 ) ) * 0.000289
		);

	},

	calcSunTrueLong: function ( timeJulian ) {

		return (
			this.calcGeomMeanLongSun( timeJulian ) + this.calcSunEqOfCenter( timeJulian )
		);

	},

	calcSunApparentLong: function ( timeJulian ) {

		const o = this.calcSunTrueLong( timeJulian );
		const omega = 125.04 - 1934.136 * timeJulian;
		return o - 0.00569 - 0.00478 * Math.sin( radians( omega ) );

	},

	calcSolarDeclination: function ( date ) {

		const timeJulian = this.calcTimeJulian( date );
		const e = this.calcObliquityCorrection( timeJulian );
		const lambda = this.calcSunApparentLong( timeJulian );
		const sint = Math.sin( radians( e ) ) * Math.sin( radians( lambda ) );
		return degrees( Math.asin( sint ) );

	},

	calcEquationOfTime: function ( date ) {

		const timeJulian = this.calcTimeJulian( date );
		const epsilon = this.calcObliquityCorrection( timeJulian );
		const l0 = this.calcGeomMeanLongSun( timeJulian );
		const e = this.calcEccentricityEarthOrbit( timeJulian );
		const m = this.calcGeomMeanAnomalySun( timeJulian );
		const y = pow2( Math.tan( radians( epsilon / 2 ) ) );
		const sin2l0 = Math.sin( radians( 2 * l0 ) );
		const sinm = Math.sin( radians( m ) );
		const cos2l0 = Math.cos( radians( 2 * l0 ) );
		const sin4l0 = Math.sin( radians( 4 * l0 ) );
		const sin2m = Math.sin( radians( 2 * m ) );
		const eqTime =
			y * sin2l0 -
			2 * e * sinm +
			4 * e * y * sinm * cos2l0 -
			0.5 * y * y * sin4l0 -
			1.25 * e * e * sin2m;
		return degrees( eqTime ) * 4;

	},

	calcTrueSolarTime: function ( date, longitude ) {

		const eqTime = this.calcEquationOfTime( date );
		const time = this.calcTimeDecimal( date );
		const offset = this.getOffset( date );
		const solarTimeFix = eqTime + 4 * longitude - 60 * offset;
		let trueSolarTime = time * 60 + solarTimeFix;
		while ( trueSolarTime > 1440 ) trueSolarTime -= 1440;
		return trueSolarTime;

	},

	calcHourAngle: function ( date, longitude ) {

		const trueSolarTime = this.calcTrueSolarTime( date, longitude );
		let hourAngle = trueSolarTime / 4 - 180;
		if ( hourAngle < -180 ) hourAngle += 360;
		return hourAngle;

	},

	calcSolarZenith: function ( date, latitude, longitude, refraction ) {

		const solarDeclination = this.calcSolarDeclination( date );
		const hourAngle = this.calcHourAngle( date, longitude );

		const solarDeclinationSin = Math.sin( radians( solarDeclination ) );
		const solarDeclinationCos = Math.cos( radians( solarDeclination ) );
		const latitudeSin = Math.sin( radians( latitude ) );
		const latitudeCos = Math.cos( radians( latitude ) );
		const hourAngleCos = Math.cos( radians( hourAngle ) );

		const csz =
			latitudeSin * solarDeclinationSin +
			latitudeCos * solarDeclinationCos * hourAngleCos;
		let solarZenith = degrees( Math.acos( csz ) );

		if ( refraction ) {

			const solarElevation = 90 - solarZenith;
			let refractionCorrection = 0;
			const te = Math.tan( radians( solarElevation ) );
			if ( solarElevation <= 85 && solarElevation > 5 ) {

				refractionCorrection =
					58.1 / te - 0.07 / Math.pow( te, 3 ) + 0.000086 / Math.pow( te, 5 );

			} else if ( solarElevation <= 85 && solarElevation > -0.575 ) {

				refractionCorrection =
					1735 +
					solarElevation *
						( -518.2 +
							solarElevation *
								( 103.4 + solarElevation * ( -12.79 + solarElevation * 0.711 ) ) );

			} else {

				refractionCorrection = -20.774 / te;

			}

			solarZenith -= refractionCorrection;

		}

		return solarZenith;

	},

	calcSolarAzimuth: function ( date, latitude, longitude ) {

		const solarDeclination = this.calcSolarDeclination( date );
		const hourAngle = this.calcHourAngle( date, longitude );
		const solarZenith = this.calcSolarZenith( date, latitude, longitude, false );

		// const hourAngleSign = Math.sign( hourAngle );
		const solarZenithSin = Math.sin( radians( solarZenith ) );
		const solarZenithCos = Math.cos( radians( solarZenith ) );
		const latitudeSin = Math.sin( radians( latitude ) );
		const latitudeCos = Math.cos( radians( latitude ) );

		let output = Math.acos(
			( solarZenithCos * latitudeSin -
				Math.sin( radians( solarDeclination ) ) ) /
				( solarZenithSin * latitudeCos )
		);
		output = degrees( output );
		if ( hourAngle > 0 ) {

			return ( output + 180 ) % 360;

		} else {

			return ( 540 - output ) % 360;

		}

	},

	calcSolarAltitude: function ( date, latitude, longitude ) {

		return 90 - this.calcSolarZenith( date, latitude, longitude );

	},

	calcAirMass: function ( date, latitude, longitude ) {

		const solarZenith = this.calcSolarZenith( date, latitude, longitude );
		if ( solarZenith < 90 ) {

			const rad = radians( solarZenith );
			const a = 1.002432 * Math.pow( Math.cos( rad ), 2.0 );
			const b = 0.148386 * Math.cos( rad );
			const X = a + b + 0.0096467;
			const c = Math.pow( Math.cos( rad ), 3.0 );
			const d = 0.149864 * Math.pow( Math.cos( rad ), 2.0 );
			const e = 0.0102963 * Math.cos( rad );
			const Y = c + d + e + 0.000303978;
			return X / Y;

		} else {

			return 0;

		}

	},

	calcExtraIrradiance: function ( date ) {

		const start = new Date( date.getFullYear(), 0, 0 );
		const diff = date.getTime() - start.getTime();
		const oneDay = 1000 * 60 * 60 * 24;
		// const day = Math.ceil(diff / oneDay);
		// const day = Math.floor(diff / oneDay);
		const day = diff / oneDay;

		// 1367 = accepted solar constant [W/m^2]
		return 1367 * ( 1.0 + Math.cos( radians( ( 360 * day ) / 365 ) ) / 30 );

	},

	calcSolarAttenuation: function ( theta, turbitity ) {

		let tau = [ 0.0, 0.0, 0.0 ];
		const tmp = 93.885 - ( theta / Math.PI ) * 180.0;
		if ( tmp < 0 ) {

			return tau;

		}

		const beta = 0.0460836582205 * turbitity - 0.04586025928522;
		const m =
			1.0 /
			( Math.cos( theta ) +
				0.15 * Math.pow( 93.885 - ( theta / Math.PI ) * 180.0, -1.253 ) ); // Relative Optical Mass
		const lambda = [ 0.65, 0.57, 0.475 ];
		for ( let i = 0; i < 3; i++ ) {

			// Rayleigh Scattering
			// lambda in um
			const tauR = Math.exp( -m * 0.008735 * Math.pow( lambda[ i ], -4.08 ) );

			// Aerosal (water + dust) attenuation
			// beta - amount of aerosols present
			// alpha - ratio of small to large particle sizes. (0:4, usually 1.3)
			const alpha = 1.3;
			const tauA = Math.exp( -m * beta * Math.pow( lambda[ i ], -alpha ) ); // lambda should be in um

			tau[ i ] = tauR * tauA;

		}

		return tau;

	},
};
