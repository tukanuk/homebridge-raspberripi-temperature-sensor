/* eslint-disable max-len */
import { Service, PlatformAccessory, CharacteristicGetCallback } from 'homebridge';

import { HTTPTempHomebridgePlatform } from './platform';

//import { OpenWeatherMap } from 'openweathermap-ts';
import OpenWeatherMap from '../node_modules/openweathermap-ts/dist/app';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class HTTPTempPlatformAccessory {
  private service: Service;

  private accessoryStates = {
    Temperature: 99.9,
  };

  constructor(
    private readonly platform: HTTPTempHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
    .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tukanuk')
    .setCharacteristic(this.platform.Characteristic.Model, 'AS-HTTPTemp-V1')
    .setCharacteristic(this.platform.Characteristic.SerialNumber, '000003422');
    
    // get the TemperatureSensor service if it exists, otherwise create a new TemperatureSensor service
    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) || 
    this.accessory.addService(this.platform.Service.TemperatureSensor);
    
    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);
    
    // register handlers for the CurrentTemperature Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
    .on('get', this.getTemperature.bind(this));
    
    
    // set accessory information
    // first attempt at adding humidty sensor
      this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Tukanuk')
      .setCharacteristic(this.platform.Characteristic.Model, 'Humidty-V1')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, '000003433');

    // get the TemperatureSensor service if it exists, otherwise create a new TemperatureSensor service
    this.service = this.accessory.getService(this.platform.Service.HumiditySensor) || 
                    this.accessory.addService(this.platform.Service.HumiditySensor);

    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // register handlers for the CurrentTemperature Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .on('get', this.getHumidity.bind(this));

    /**
     * Creating multiple services of the same type.
     */

    // Add two "motion sensor" services to the accessory that will trigger when min or max threshold is exceeded
    const motionSensorOneService = this.accessory.getService('Min Temperature Exceeded') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Min Temperature Exceeded', '029ca001-8c05-4734-bbdf-5ee0ae5d9fa4');

    const motionSensorTwoService = this.accessory.getService('Max Temperature Exceeded') ||
      this.accessory.addService(this.platform.Service.MotionSensor, 'Max Temperature Exceeded', 'c6bd9d19-159f-4011-aa63-6f953c4c3756');

    /**
     * Updating characteristics values asynchronously.
     */

    let minStateActive = false;
    let maxStateActive = false;

    const updateInterval = (this.platform.config.updateInterval as number);

    setInterval(() => {

      // Request update of the temperature and push it to HomeKit
      this.service.setCharacteristic(this.platform.Characteristic.CurrentTemperature, this.accessoryStates.Temperature);

      if(this.platform.config.minTemperatureThreshold){
        minStateActive = this.accessoryStates.Temperature <= (this.platform.config.minTemperatureThreshold as number);
        this.platform.log.debug('Min Temperature Threshold of ' + this.platform.config.minTemperatureThreshold + ' exceeded', minStateActive);
      } else{
        minStateActive = false;
        this.platform.log.debug('Min Temperature Threshold missing', minStateActive);
      }

      if(this.platform.config.maxTemperatureThreshold){
        maxStateActive = this.accessoryStates.Temperature >= (this.platform.config.maxTemperatureThreshold as number);
        this.platform.log.debug('Max Temperature Threshold of ' + this.platform.config.maxTemperatureThreshold + ' exceeded', maxStateActive);
      } else{
        maxStateActive = false;
        this.platform.log.debug('Max Temperature Threshold missing', maxStateActive);
      }

      motionSensorOneService.updateCharacteristic(this.platform.Characteristic.MotionDetected, minStateActive);
      motionSensorTwoService.updateCharacteristic(this.platform.Characteristic.MotionDetected, maxStateActive);

    }, updateInterval * 1000);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to get the current temperature from openweathermap.
   * 
   */
  getTemperature(callback: CharacteristicGetCallback) {
    // const openWeatherMapApiKey = (this.platform.config.openWeatherMapApiKey as string);

    // const openWeather = new OpenWeatherMap({
    //   apiKey: openWeatherMapApiKey,
    // });

    // if((this.platform.config.temperatureUnit as string) === 'imperial'){
    //   openWeather.setUnits('imperial');
    // } else{
    //   openWeather.setUnits('metric');
    // }

    // // Get the current temperature value from openwethermap.org
    // openWeather
    //   .getCurrentWeatherByCityId((this.platform.config.openWeatherMapCityID as number))
    //   .then((weather) => {
    //     this.accessoryStates.Temperature = weather.main.temp;
    //     this.platform.log.info('Get Characteristic Current Temperature ->', weather.main.temp + ' (' + weather.name +')');
    //   })
    //   .catch((error) => this.platform.log.error('Error is ', error));
    
    
    // const temperature = this.accessoryStates.Temperature ;
    
    // this.platform.log.debug('Get Characteristic Current Temperature ->', temperature);
    
    const temperature = 66.6 ;
    this.platform.log.info('Get RaspPi Temperature ->', temperature);
    
    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, temperature);
  }
  
  // TODO: get humidity
  getHumidity(callback: CharacteristicGetCallback) {
    
    const humidity = 50.0 ;
    this.platform.log.info('Get RaspPi Humidity ->', humidity);

    // you must call the callback function
    // the first argument should be null if there were no errors
    // the second argument should be the value to return
    callback(null, humidity);
  }
}
