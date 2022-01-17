import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { GooglePlacesService } from '../../services/google-places.service';
import { GoogleDrawingService } from '../../services/google-drawing.service';
import { DataService } from '../../services/data.service';
import { StateService } from '@uirouter/angular';
import { UserService } from '../../services/user/user.service';
import { ApiService } from '../../services/api.service';
import { Router, NavigationEnd } from '@angular/router'
import * as async from 'async';
import * as moment from 'moment';
import { API_BASE } from '../../constants/constants';

declare var WOW;
declare var AI;
declare var $;
declare var google;

@Component({
  selector: 'app-my-lawn',
  templateUrl: './my-lawn.component.html',
  styleUrls: ['./my-lawn.component.scss']
})
export class MyLawnComponent implements OnInit {
  data = {};
  rawData: any;
  finalData: any;
  weatherInfo: any;
  markerX: number = 0;
  markerY: number = 0;
  loading: boolean = false;
  showContent: boolean = true;
  lat: number;
  lng: number;
  lineChartData: Array<any>;
  lineChartLabels: Array<any>;
  lineChartColors: Array<any>;
  lineChart2Data: Array<any>;
  lineChart2Colors: Array<any>;
  tempCaption: String = '';
  rainfallCaption: String = '';
  cloudCoverCaption: String = '';
  cUserID: any = 0;
  cLawnID: any = 0;
  lawnSize: any = 0;
  areaName: String = "";
  soilData: any = [];

  clay: any;
  silt: any;
  sand: any;
  om: any;
  ph: any;
  cec: any;
  waterCapacity: any;
  soilname: any;
  chartData: any;
  isSoilData: boolean = true;
  isClimateData: boolean = false;
  isLawnData: boolean = false;
  climateData: any;
  options: any;

  organicMatterLabel: any;
  soilPHLabel: any;
  sodiumLabel: any;
  CECLabel: any;
  calciumLabel: any;
  ironLabel: any;
  copperLabel: any;
  magnesiumLabel: any;
  manganeseLabel: any;
  zincLabel: any;
  phosphorusLabel: any;
  potassiumLabel: any;
  SolSaltsLabel: any;
  sulfurLabel: any;
  boronLabel: any;
  CEC_CalciumLabel: any;
  CEC_MagnesiumLabel: any;
  CEC_PotassiumLabel: any;
  CEC_sodiumLabel: any;
  soilProfileData: any = {};
  isSoilProfileData: boolean = false;
  coolerTempLabel: any;
  degreeLabel: any;
  weatherLabel: any;
  rainLabel: any;
  grossPotenLable: any;
  grossPotenPer: any;
  startDate: any;
  endDate: any;
  dateTested: any = "Soil Test Included for Customers";
  isImage: boolean = false;
  imagePath: String = "";
  currentYear: any;


  constructor(
    private googlePlacesService: GooglePlacesService,
    private googleDrawingService: GoogleDrawingService,
    public dataService: DataService,
    private apiService: ApiService,
    private router: Router,
    private userService: UserService,
    private stateService: StateService
  ) {

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
    if (!this.userService.isAuth()) {
      this.router.navigate(['/welcome-back']);
    }
    else {
      this.loading = true;
    }

  }

  ngOnInit() {
    new WOW().init();
    AI.init();
    this.getClimateAnalysisData();
    this.dataService.getLatLng();
    this.dataService.getAreaName();
    this.lat = this.dataService.lat;
    this.lng = this.dataService.lng;
    //this.getWeatherOps();
    this.setMyLawnLabel();

    this.startDate = moment().subtract(14, "days").format("MMM DD");
    this.endDate = moment().format("MMM DD");
    this.currentYear = moment().format("YYYY");

  }

  getClimateAnalysisData() {
    async.waterfall([
      (callback1) => {
        this.userService.getMyaccount(this.userService.readSession().id).subscribe(resp => {
          if (resp.data.length) {

            console.log("ITS here", resp.data);
            if (resp.data[0].lawn_image !== "") {
              this.isImage = true;
              this.imagePath = API_BASE + resp.data[0].lawn_image;
            }

            this.cUserID = resp.data[0].id;
            if (resp.data[0].user_Lawn.length) {
              this.cLawnID = resp.data[0].user_Lawn[0].id;
              if (resp.data[0].user_Lawn[0].lawn_info[0].observed_lawn_size) {
                this.lawnSize = resp.data[0].user_Lawn[0].lawn_info[0].observed_lawn_size;
              } else {
                this.lawnSize = resp.data[0].user_Lawn[0].lawn_info[0].initial_lawn_size;
              }
              this.areaName = resp.data[0].user_Lawn[0].address;
            }
            //Check if user lawn already created or not
            if (resp.data[0].user_Lawn.length > 0) {
              this.isLawnData = true;
              localStorage.setItem('lawanID', this.cLawnID);
            }
          }
          callback1(null, this.cLawnID);
        }, err => {
          callback1(null, this.cLawnID);
        });

      },
      (lawanID, callback2) => {
        this.userService.getClimateData(this.cLawnID).subscribe(res => {
          this.climateData = [];
          if (res.length) {
            this.isClimateData = true;
            var climateHistorical = res[0].climate_Historical;

            for (var i = 0; i < climateHistorical.length; i++) {
              var obj = {
                "average_mly_cloud_cover": climateHistorical[i].avg_cloud,
                'average_mly_max_temp': climateHistorical[i].avg_max,
                'average_mly_min_temp': climateHistorical[i].avg_min,
                'average_mly_precip': climateHistorical[i].avg_precip,
                'average_mly_temp': climateHistorical[i].avg_temp,
                'month': climateHistorical[i].months
              }
              this.climateData.push(obj);
            }
          }
          callback2(null, lawanID);
        }, err => {
          callback2(null, lawanID);
        });
      },
      (lawanID, callback3) => {
        if (this.climateData.length) {
          this.dataService.processWeatherData(this.climateData);
        }
        this.userService.getSoilData(this.cLawnID).subscribe(response => {
          if (response.length) {
            if (response[0].soil_USDA.length == 0) {
              this.isSoilData = false;
            }
            this.soilData = response;
            this.clay = response[0].soil_USDA[0].clay;
            this.silt = response[0].soil_USDA[0].silt;
            this.sand = response[0].soil_USDA[0].sand;
            this.om = response[0].soil_USDA[0].OM;
            this.ph = response[0].soil_USDA[0].pH;
            this.cec = response[0].soil_USDA[0].cation_exchange_capacity;
            this.waterCapacity = response[0].soil_USDA[0].water_capacity;
            this.soilname = response[0].soil_USDA[0].soil_name;

            //set data for soil profile
            if (response[0].soil_Test.length) {
              console.log("responsesoil_Test", response)
              this.dateTested = "Soil Tested " + moment(response[0].soil_Test[0].date_tested).format("MM.DD.YY");
              this.isSoilProfileData = true;
              var newArr = [];
              for (var k in response[0].soil_Test[0]) {
                if (response[0].soil_Test[0].hasOwnProperty(k)) {
                  newArr[k] = parseFloat(response[0].soil_Test[0][k]);
                }
              }
              this.setSoilprofile(newArr);
            }
            else{
              this.dateTested="Soil Test Included for Customers";
            }


            //Set soil pH val
            var min = 5;
            var max = 9;
            var now = this.ph;
            $('.my-progress-bar').attr('aria-valuemax', now);
            var newprogress = (now - min) * 100 / (max - min);
            $('.my-progress-bar').children("div.progress").find('.progress-bar').attr('aria-valuenow', newprogress).css('width', newprogress + '%');
            // this.setChartData(this.dataService.finalData);
            if (response[0].soil_USDA[0] && response[0].soil_USDA[0].sand && response[0].soil_USDA[0].clay) {
              this.markerX = Math.ceil((100 - response[0].soil_USDA[0].sand) - response[0].soil_USDA[0].clay / 2);
              this.markerY = +response[0].soil_USDA[0].clay;
            }
          } else {
            this.isSoilData = false;
          }

          setTimeout(() => {
            callback3(null);
          }, 2000);
        }, err => {
          setTimeout(() => {
            callback3(null);
          }, 2000);
        });
      },
      (callback4) => {
        this.weatherInfo = this.dataService.weatherInfo;
        this.tempCaption = this.dataService.tempCaption;
        this.rainfallCaption = this.dataService.rainfallCaption;
        this.cloudCoverCaption = this.dataService.cloudCoverCaption;
        this.getAnalysisData();
        setTimeout(() => {
          callback4(null);
        }, 2000);

      },
    ], (err) => {
      this.dataService.getWeatherDataInfo();
      if (!err) {
        console.log("All API Proccessed Success", err);
      } else {
        console.log("All API Proccessed Error", err);
      }
      if (this.lat !== undefined && this.lng !== undefined) {
        this.googleDrawingService.initMap(this.lat, this.lng);
      } else {
        this.stateService.go('/home-new');
      }
    });
  }


  getAnalysisData() {
    let path = `?lat=${this.lat}&long=${this.lng}`;
    this.apiService.getAnalysisData(path, this.callbackAnalysisData);
  }
  callbackAnalysisData = (response) => {
    if (response.status) {
      this.data = response.data;
      this.dataService.setSoilInfo(response.data, true);
      //Set soil pH val
      var min = $('.my-progress-bar').attr('aria-valuemin');
      var max = $('.my-progress-bar').attr('aria-valuemax');
      var now = response.data.soil_composition.soil_ph;
      $('.my-progress-bar').attr('aria-valuemax', now);
      var newprogress = (now - min) * 100 / (max - min);
      $('.my-progress-bar').find('.progress-bar').attr('aria-valuenow', newprogress).css('width', newprogress + '%');
      if (this.data['soil_composition'] && this.data['soil_composition'].sand && this.data['soil_composition'].clay) {
        this.markerX = Math.ceil((100 - this.data['soil_composition'].sand) - this.data['soil_composition'].clay / 2);
        this.markerY = +this.data['soil_composition'].clay;
      }
    } else {
      this.dataService.setSoilInfo({}, false);
    }
  }


  setSoilprofile(sData) {
    this.soilProfileData = sData;
    this.organicMatterLabel = (sData.OM < 0.4 ? "Very Low" : (sData.OM < 2.6 ? "Low" : (sData.OM < 4.8 ? "Medium" : (sData.OM < 8.2 ? "High" : (sData.OM >= 8.2 ? "Very High" : 0)))));
    this.soilPHLabel = (sData.pH < 5 ? "Very Low" : (sData.pH < 5.6 ? "Low" : (sData.pH < 7.7 ? "Normal" : (sData.pH < 8 ? "High" : (sData.pH >= 8 ? "Very High" : 0)))));
    this.sodiumLabel = (sData.Sodium < 80 ? "Very Low" : (sData.Sodium < 100 ? "Low" : (sData.Sodium < 120 ? "Medium" : (sData.Sodium < 160 ? "High" : (sData.Sodium >= 160 ? "Very High" : 0)))));
    this.CECLabel = (sData.CEC < 3 ? "Very Low" : (sData.CEC < 8 ? "Low" : (sData.CEC < 15 ? "Medium" : (sData.CEC < 25 ? "High" : (sData.CEC >= 25 ? "Very High" : 0)))));
    this.calciumLabel = (sData.Calcium < 50 ? "Very Low" : (sData.Calcium < 330 ? "Low" : (sData.Calcium < 500 ? "Medium" : (sData.Calcium < 700 ? "High" : (sData.Calcium >= 700 ? "Very High" : 0)))));
    this.ironLabel = (sData.Iron < 71 ? "Very Low" : (sData.Iron < 94 ? "Low" : (sData.Iron < 131 ? "Medium" : (sData.Iron < 206 ? "High" : (sData.Iron >= 206 ? "Very High" : 0)))));
    this.copperLabel = (sData.Copper < 0.8 ? "Very Low" : (sData.Copper < 1.5 ? "Low" : (sData.Copper < 2.6 ? "Medium" : (sData.Copper < 4.9 ? "High" : (sData.Copper >= 4.9 ? "Very High" : 0)))));
    this.magnesiumLabel = (sData.Magnesium < 5 ? "Very Low" : (sData.Magnesium < 50 ? "Low" : (sData.Magnesium < 75 ? "Medium" : (sData.Magnesium < 100 ? "High" : (sData.Magnesium >= 100 ? "Very High" : 0)))));
    this.manganeseLabel = (sData.Manganese < 5 ? "Very Low" : (sData.Manganese < 11 ? "Low" : (sData.Manganese < 22 ? "Medium" : (sData.Manganese < 89 ? "High" : (sData.Manganese >= 89 ? "Very High" : 0)))));
    this.zincLabel = (sData.Zinc < 0.4 ? "Very Low" : (sData.Zinc < 2.6 ? "Low" : (sData.Zinc < 4.8 ? "Medium" : (sData.Zinc < 8.2 ? "High" : (sData.Zinc >= 8.2 ? "Very High" : 0)))));
    this.phosphorusLabel = (sData.Phosphorus < 9 ? "Very Low" : (sData.Phosphorus < 19 ? "Low" : (sData.Phosphorus < 29 ? "Medium" : (sData.Phosphorus < 49 ? "High" : (sData.Phosphorus >= 48 ? "Very High" : 0)))));
    this.potassiumLabel = (sData.Potassium < 30 ? "Very Low" : (sData.Potassium < 60 ? "Low" : (sData.Potassium < 120 ? "Medium" : (sData.Potassium < 182 ? "High" : (sData.Potassium >= 182 ? "Very High" : 0)))));
    this.SolSaltsLabel = (sData.Sol_Salts < 0.3 ? "Very Low" : (sData.Sol_Salts < 0.6 ? "Low" : (sData.Sol_Salts < 1 ? "Medium" : (sData.Sol_Salts < 2 ? "High" : (sData.Sol_Salts >= 2 ? "Very High" : 0)))));
    this.sulfurLabel = (sData.Sulfur < 3 ? "Very Low" : (sData.Sulfur < 7 ? "Low" : (sData.Sulfur < 12 ? "Medium" : (sData.Sulfur < 17 ? "High" : (sData.Sulfur >= 17 ? "Very High" : 0)))));
    this.boronLabel = (sData.Boron < 0.3 ? "Very Low" : (sData.Boron < 0.5 ? "Low" : (sData.Boron < 1.2 ? "Medium" : (sData.Boron < 2.5 ? "High" : (sData.Boron >= 2.5 ? "Very High" : 0)))));
  }

  setMyLawnLabel() {
    async.waterfall([
      (callback1) => {
        this.userService.getAvgTempData(this.userService.readSession().id).subscribe(resp => {
          if (resp.length) {
            if (resp[0].data_info.length) {
              var tempTotal = 0;
              var potTotal = 0;
              var avgTemp;
              var avgPot = 0;
              var loop = 0;

              for (var k in resp[0].data_info) {
                tempTotal = (tempTotal + parseFloat(resp[0].data_info[k].value));
                var getGrowthPotential = (Math.exp((-0.5 * Math.pow(((parseFloat(resp[0].data_info[k].value) - 68) / 10), 2))) * 100);
                potTotal = (potTotal + getGrowthPotential);
                loop++;
              }

              if (resp[0].data_info.length == loop) {
                avgTemp = (tempTotal / resp[0].data_info.length);
                avgPot = (potTotal / resp[0].data_info.length);
                if (avgPot < 30) {
                  this.grossPotenLable = "Low Growth";
                  this.grossPotenPer = avgPot.toFixed(2) + "% GROWTH POTENTIAL";
                } else if (avgPot > 30 && avgPot < 70) {
                  this.grossPotenLable = "Medium Growth";
                  this.grossPotenPer = avgPot.toFixed(2) + "% GROWTH POTENTIAL";
                } else {
                  this.grossPotenLable = "High Growth";
                  this.grossPotenPer = avgPot.toFixed(2) + "% GROWTH POTENTIAL";
                }

                if (avgTemp > 0) {
                  this.coolerTempLabel = "Warmer Temps";
                  this.degreeLabel = avgTemp.toFixed(2) + " DEGREES F WARMER THAN NORMAL";
                  callback1(null);
                } else {
                  this.coolerTempLabel = "Cooler Temps";
                  this.degreeLabel = avgTemp.toFixed(2) + " DEGREES F COOLER THAN NORMAL";
                  callback1(null);
                }
              }
            } else {
              callback1(null);
            }
          } else {
            callback1(null);
          }
        }, err => {
          callback1(null);

        });
      },
      (callback2) => {
        this.userService.getAvgPrecipData(this.userService.readSession().id).subscribe(resp => {
          if (resp.length) {
            if (resp[0].data_info.length) {
              var tempTotal = 0;
              var avgTemp = 0;
              var loop = 0;
              for (var k in resp[0].data_info) {
                tempTotal = (tempTotal + parseFloat(resp[0].data_info[k].value));
                loop++;
              }
              if (resp[0].data_info.length == loop) {
                avgTemp = (tempTotal / resp[0].data_info.length);
                if (avgTemp > 0) {
                  this.weatherLabel = "More Rainfall";
                  this.rainLabel = avgTemp.toFixed(2) + '" MORE RAIN THAN NORMAL';
                  callback2(null);
                } else {
                  this.weatherLabel = "Less Rainfall";
                  this.rainLabel = avgTemp.toFixed(2) + '" LESS RAIN THAN NORMAL';
                  callback2(null);
                }
              } else {
                callback2(null);
              }
            } else {
              callback2(null);
            }
          } else {
            callback2(null);
          }
        }, err => {
          callback2(null);
        });
      },
    ], (err, data) => {
      this.loading = false;
      console.log("Proceesed==================");
    });
  }


  addAnotherLawn() {
    console.log('add another lawn');
  }

  startOver() {
    this.googleDrawingService.removeShapes();
  }

  rotateMap() {
    this.googleDrawingService.mapRotate();
    // this.googleDrawingService.map.setCenter({lat:this.lat, lng:this.lng});
  }

  map2D() {
    this.googleDrawingService.map2D();
  }

  map3D() {
    this.googleDrawingService.map3D();
  }


}