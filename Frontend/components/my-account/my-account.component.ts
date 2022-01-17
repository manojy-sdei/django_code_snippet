import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { ConfirmationService, Message } from "primeng/primeng";
import { MailchimpsService } from '../../services/mailchimps/mailchimps.service';

import { GooglePlacesService } from '../../services/google-places.service';
import { GoogleDrawingService } from '../../services/google-drawing.service';
import { DataService } from '../../services/data.service';
import { ApiService } from '../../services/api.service';

import * as async from 'async';
import { DEFAULT_API_ERR } from '../../constants/constants';
import { StateService } from '@uirouter/angular';
import * as moment from 'moment';
import { API_BASE } from '../../constants/constants';


declare var WOW;
declare var AI;
declare var $;
declare let google: any;

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit {

  userProfileForm: FormGroup;
  changePasswordForm: FormGroup;
  isSubmited: boolean = false;
  loading: boolean = false;
  msgs: Message[];
  showContent: boolean = true;
  productPlanPopup: boolean = false;
  isManualReview: boolean = false;
  showLawnBox: boolean = true;
  //
  climateData: any;
  //
  data = {};
  rawData: any;
  finalData: any;
  weatherInfo: any;

  markerX: number = 0;
  markerY: number = 0;
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
  test: any = null;
  cUserID: any = 0;
  cLawnID: any = 0;
  lawnSize: any = 0;
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
  areaName: String = "";
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
  maxResultValue: String = '';
  maxResultsoil_ph: String = '';
  maxResultCaption: String = '';
  maxValue: any;
  maxValuePh: any;
  maxValueCaption: any;
  isSoilInfo: boolean = false;
  isPreOrdered: boolean = false;
  isLargeLawn: boolean = false;
  isSkipPage: boolean = false;
  isSkipPage2: boolean = false;
  isImage: boolean = false;
  imagePath: String = "";
  currentYear: any;


  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private userService: UserService, private googlePlacesService: GooglePlacesService,
    private googleDrawingService: GoogleDrawingService, private stateService: StateService,
    private dataService: DataService,
    private apiService: ApiService, private mailChimpsService: MailchimpsService) {

    localStorage.setItem('reffererURL', '/my-account');
    if (!this.userService.isAuth()) {
      this.router.navigate(['/welcome-back']);
    } else {
      this.dataService.getLatLng();
      this.lat = this.dataService.lat;
      this.lng = this.dataService.lng;

      console.log("lat",this.lat);


      if (!this.lat || !this.lng) {
        this.router.navigate(['/add-lawn-address']);
      }
      this.userProfileForm = this.fb.group({
        profile_id: [''],
        user: [[this.userService.readSession().id], [Validators.required]],
        first_name: ['', [Validators.required]],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        address: [null, Validators.required],
        user_type: ["Lead"],
      });
    }

    this.changePasswordForm = this.fb.group({
      id: [''],
      oldPassword: [null, [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: this.passwordConfirming });

    this.router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        this.router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnInit() {
    new WOW().init();
    AI.init();
    this.setUserProfile();
    this.getClimateAnalysisData();

    this.dataService.getLatLng();
    this.dataService.getAreaName();
    this.lat = this.dataService.lat;
    this.lng = this.dataService.lng;
    if (this.dataService.isSoilInfo) {
      this.isSoilInfo = true;
    }
    this.startDate = moment().subtract(14, "days").format("MMM DD");
    this.endDate = moment().format("MMM DD");
    this.currentYear = moment().format("YYYY");

    this.dataService.getServiceData();
    this.lawnSize = this.dataService.lawn_size ? this.dataService.lawn_size : this.lawnSize;
    console.log('lawnsize',  localStorage.getItem('reviewFlag'))
    if (this.lawnSize > 7500) {
      this.isManualReview = true;
      
    }
    if (this.lawnSize < 7500) {
      this.isManualReview = false;
    }

  }

  requestLawnReview(flag){
    localStorage.setItem('reviewFlag', flag);
  }

  getClimateAnalysisData() {
    this.loading = true;
    async.waterfall([
      (callback1) => {
        this.userService.getMyaccount(this.userService.readSession().id).subscribe(resp => {
          console.log("I ma gereree", resp.data)
          if (resp.data.length) {
            if (resp.data[0].lawn_image !== "") {
              this.isImage = true;
              this.imagePath = API_BASE + resp.data[0].lawn_image;
            }

            console.log("API_BASE", API_BASE);
            console.log("this.imagePath", this.imagePath);

            this.cUserID = resp.data[0].id;
            if (resp.data[0].user_Lawn.length) {
              this.cLawnID = resp.data[0].user_Lawn[0].id;
              if (resp.data[0].user_Lawn[0].lawn_info[0].observed_lawn_size) {
                this.lawnSize = resp.data[0].user_Lawn[0].lawn_info[0].observed_lawn_size;
              } else {
                this.lawnSize = resp.data[0].user_Lawn[0].lawn_info[0].initial_lawn_size;
              }

              this.areaName = resp.data[0].user_Lawn[0].address;

              this.isLawnData = true;
              localStorage.setItem('lawanID', this.cLawnID);
              let center = {
                'lat': parseFloat(resp.data[0].user_Lawn[0].lat),
                'lng': parseFloat(resp.data[0].user_Lawn[0].lng)
              }
              this.lat = parseFloat(resp.data[0].user_Lawn[0].lat);
              this.lng = parseFloat(resp.data[0].user_Lawn[0].lng);
              localStorage.setItem('latlng', JSON.stringify(center));
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
        if (this.dataService.isSoilInfo) {
          if (parseFloat(this.dataService.soilInfo['soil_composition']['sand']) > 65) {
            this.maxResultValue = 'Sandy';
          } else if (parseFloat(this.dataService.soilInfo['soil_composition']['clay']) > parseFloat(this.dataService.soilInfo['soil_composition']['silt'])) {
            this.maxResultValue = 'Clay';
          } else {
            this.maxResultValue = 'Silty';
          }
          this.maxValuePh = parseFloat(this.dataService.soilInfo['soil_composition']['soil_ph']);
          if (this.maxValuePh < 6.5) {
            this.maxResultsoil_ph = "acidic";
          } else if (this.maxValuePh >= 6.5 && this.maxValuePh <= 7.5) {
            this.maxResultsoil_ph = "balanced pH";
          }
          else {
            this.maxResultsoil_ph = "basic";
          }
          this.maxValueCaption = parseFloat(this.dataService.soilInfo['soil_composition']['cation_exchange_capacity']);
          if (this.maxValueCaption < 10) {
            this.maxResultCaption = "poorly";
          } else if (this.maxValueCaption >= 10 && this.maxValueCaption <= 25) {
            this.maxResultCaption = "well";
          } else {
            this.maxResultCaption = "very well";
          }
        }
        callback4(null);
      },
      (callback5) => {
        this.weatherInfo = this.dataService.weatherInfo;
        this.tempCaption = this.dataService.tempCaption;
        this.rainfallCaption = this.dataService.rainfallCaption;
        this.cloudCoverCaption = this.dataService.cloudCoverCaption;
        this.getAnalysisData();
        setTimeout(() => {
          callback5(null);
        }, 2000);

      },
      (callback6) => {
        this.userService.getPreOrder(this.userService.readSession().id).subscribe(res => {
          if (res.length) {
            if (res[0].status == "No Pre-Order") {
              this.isPreOrdered = false;
            } else {
              this.isPreOrdered = true;
            }
          }
          callback6(null);
        }, err => {
          callback6(null);
        });
      },
      (callback7) => {
        if (this.lawnSize > 7500 && !this.isPreOrdered) {
          this.isLargeLawn = true;
        } else {
          this.isLargeLawn = false;
        }
        callback7(null);
      },
      (callback8) => {
        this.userService.getUserQuestions(this.userService.readSession().id).subscribe(resp => {
          if (resp.length) {
            if (resp[0].UserQuestionOption_SQO.length > 0 && resp[0].UserQuestionOption_SQO.length < 3) {
              this.isSkipPage = true;
              this.isSkipPage2 = false;
            }
            else if (resp[0].UserQuestionOption_SQO.length > 2 && resp[0].UserQuestionOption_SQO.length < 5) {
              this.isSkipPage = false;
              this.isSkipPage2 = true;
            }
            else {
              this.isSkipPage = false;
              this.isSkipPage2 = false;
            }
          }
          else {
            this.isSkipPage = true;
            this.isSkipPage2 = false;
          }
          callback8(null);
        }, err => {
          callback8(null);
        });

      },

    ], (err) => {
      this.dataService.getWeatherDataInfo();
      if (!err) {
        console.log("All API Proccessed Success", err);
      } else {
        console.log("All API Proccessed Error", err);
      }
      this.setMyLawnLabel();
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




  setSoilMarker() {

  }
  rotateMap() {
    this.googleDrawingService.mapRotate();
    //this.googleDrawingService.map.setCenter({ lat: this.lat, lng: this.lng });
  }

  map2D() {
    this.googleDrawingService.map2D();
  }

  map3D() {
    this.googleDrawingService.map3D();
  }

  setUserProfile() {
    this.userService.getUserProfile(this.userService.readSession().id).subscribe(resp => {
      if (resp.length > 0) {
        this.userProfileForm.patchValue({
          profile_id: resp[0].id,
          user: this.userService.readSession().id,
          first_name: resp[0].first_name,
          last_name: resp[0].last_name,
          email: this.userService.readSession().email,
          phone: resp[0].phone,
          address: resp[0].address,
          user_type: resp[0].user_type,
        });
      } else {
        this.userProfileForm.patchValue({
          user: this.userService.readSession().id,
          first_name: "",
          last_name: "",
          email: this.userService.readSession().email,
          phone: "",
          address: "",
          user_type: "Lead",
        });
      }
    }, err => {
    });

  }

  /* Login */
  updateUserProfile() {
    this.isSubmited = false;
    this.loading = true;
    if (this.userProfileForm.invalid) {
      this.isSubmited = true;
      this.loading = false;
      return;
    }

    //for mail chimp API
    var postMailChimpsData = {
      "email_address": this.userProfileForm.value.email,
      "FNAME": this.userProfileForm.value.first_name,
      "LNAME": this.userProfileForm.value.last_name,
      //"address": this.userProfileForm.value.address,
    }
    this.mailChimpsService.updateCustomerSubscriber(postMailChimpsData).subscribe(mailres => {
      console.log("mailres", mailres)
    });

    //Create/Update user profile info
    var postData = {};
    if (this.userService.readSession().userProfile) {
      postData = {
        "profile_id": this.userProfileForm.value.profile_id,
        "user": this.userProfileForm.value.user,
        "first_name": this.userProfileForm.value.first_name,
        "last_name": this.userProfileForm.value.last_name,
        "email": this.userProfileForm.value.email,
        "phone": this.userProfileForm.value.phone,
        "address": this.userProfileForm.value.address,
        "user_type": this.userProfileForm.value.user_type,
        "userProfile": true
      }
      this.userService.updateUser(postData).subscribe(res => {
        var newSessionData = Object.assign(this.userService.readSession(), postData);
        this.userService.setSession(newSessionData);
        this.loading = false;
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: 'Success Message', detail: "Profile updated successfully." });

      }, err => {
        this.msgs = [];
        this.loading = false;
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
      });
    } else {
      postData = {
        "user": this.userProfileForm.value.user,
        "first_name": this.userProfileForm.value.first_name,
        "last_name": this.userProfileForm.value.last_name,
        "email": this.userProfileForm.value.email,
        "phone": this.userProfileForm.value.phone,
        "user_type": this.userProfileForm.value.user_type,
        "address": this.userProfileForm.value.address
      }
      this.userService.createProfile(postData).subscribe(res => {

        var sessionData = {
          "profile_id": res.id,
          "user": this.userProfileForm.value.user,
          "first_name": this.userProfileForm.value.first_name,
          "last_name": this.userProfileForm.value.last_name,
          "email": this.userProfileForm.value.email,
          "phone": this.userProfileForm.value.phone,
          "address": this.userProfileForm.value.address,
          "user_type": this.userProfileForm.value.user_type,
          "userProfile": true
        }
        var newSessionData = Object.assign(this.userService.readSession(), sessionData);
        this.userService.setSession(newSessionData);
        this.loading = false;
        this.msgs = [];
        this.msgs.push({ severity: 'success', summary: 'Success Message', detail: "Profile updated successfully." });

      }, err => {
        this.msgs = [];
        this.loading = false;
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
      });
    }
  }


  changePassword() {
    this.isSubmited = false;
    if (this.changePasswordForm.invalid) {
      this.isSubmited = true;
      return;
    }
    this.loading = true;
    var postData = this.changePasswordForm.value;
    postData.user = true;
    var data = {
      "oldPassword": postData.oldPassword,
      "newPassword": postData.newPassword,
      "userId": this.userService.readSession().id,
    }
    this.userService.changePassword(data).subscribe(res => {
      this.msgs = [];
      this.msgs.push({ severity: 'success', summary: 'Success Message', detail: "Password updated successfully." });
      this.changePasswordForm.reset();
      setTimeout(() => {
        this.router.navigate(['/my-account']);
      }, 2000);
      this.loading = false;
    },
      err => {
        this.msgs = [];
        if (err.status == 401) {
          this.msgs.push({ severity: 'error', summary: 'Error Message', detail: JSON.parse(err._body).Status });
        } else {
          this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
        }
        this.loading = false;
      });
  }

  passwordConfirming(c: AbstractControl): any {
    if (c.get('newPassword').value !== c.get('confirmPassword').value) {
      // return {invalid: true};
      return c.get('confirmPassword').setErrors({ 'confirmError': true });
    }
  }

  showPopup() {
    this.productPlanPopup = true;
  }


}