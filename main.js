var request = require("request");


//=========================================
// buzzer -

var upmBuzzer = require("jsupm_buzzer"); // Initialize on GPIO 5
var myBuzzer = new upmBuzzer.Buzzer(5);

// Print sensor name
console.log('buzzer', myBuzzer.name());



//=========================================
// ir temp

// analog voltage, usually 3.3 or 5.0
var OTP538U_AREF = 5.0;

var tempIRSensor_lib = require('jsupm_otp538u');

// Instantiate a OTP538U on analog pins A0 and A1
// A0 is used for the Ambient Temperature and A1 is used for the
// Object temperature.
var tempIRSensor_obj = new tempIRSensor_lib.OTP538U(0, 1, OTP538U_AREF);
var ambient, object;

function checkTemp() {
  ambient = roundNum(tempIRSensor_obj.ambientTemperature(), 0);
  object = roundNum(tempIRSensor_obj.objectTemperature(), 0);
  console.log('temps', ambient, object)
}

function roundNum(num, decimalPlaces) {
  var extraNum = (1 / (Math.pow(10, decimalPlaces) * 1000));
  return (Math.round((num + extraNum) *
    (Math.pow(10, decimalPlaces))) / Math.pow(10, decimalPlaces));
}

console.log('ir temp');



//=========================================
// Flame Sensor

//=========================================




console.log('airQuality');

//=========================================
// lcd

// Load lcd module on I2C
var LCD = require('jsupm_i2clcd');

// Initialize Jhd1313m1 at 0x62 (RGB_ADDRESS) and 0x3E (LCD_ADDRESS)
var myLcd = new LCD.Jhd1313m1(0, 0x3E, 0x62);

myLcd.setCursor(0, 0);

console.log('lcd');

//======================================
// collect data

function recordData() {
  var airHazardPresent, flameHazardPresent, isAlarmOn;

  // ir temp
  checkTemp();

  



  var options = {
    url: 'http://htn.azurewebsites.net/api/sensors',
    body: {
      temp: {
        ambient: ambient,
        object: object
      }
    },
    json: true,
    method: 'post'
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('good api');
    } else {
      console.log('bad api', response.statusCode);
    }
  }

  request(options, callback);

}

var myInterval = setInterval(recordData, 3000);

process.on('SIGINT', function() {
  clearInterval(myInterval);

  console.log("Exiting...");
  process.exit(0);
});
