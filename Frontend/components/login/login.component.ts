import { Component, OnInit } from '@angular/core';
import { ConfirmationService, Message } from "primeng/primeng";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { DataService } from '../../services/data.service';
import { ZillowService } from '../../services/zillow/zillow.service';
import { ApiService } from '../../services/api.service';
import { MailchimpsService } from '../../services/mailchimps/mailchimps.service';
import { DEFAULT_API_ERR } from '../../constants/constants';
import * as async from 'async';
declare var WOW;
declare var AI;
declare var $;
declare var ga;
declare let google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  isSubmited: boolean = false;
  isSubmitedPass: boolean = false;
  isSubmitedLog: boolean = false;
  isSubmitedForgot: boolean = false;
  msgs: Message[];
  users: any = [];
  emailForm: FormGroup;
  loginForm: FormGroup;
  createPasswordForm: FormGroup;
  forgotForm: FormGroup;
  loading: boolean = false;
  emailShowContent: boolean = true;
  createPasswordShowContent: boolean = false;
  loginShowContent: boolean = false;
  forgotShowContent: boolean = false;
  successScreen: boolean = false;
  localemail: any;
  userID: any;
  userName: any;

  finishedSquareFootage: any;
  noOfFloors: string = "NOT AVAILAIBLE";
  basement: string = "NOT AVAILAIBLE";
  yearBuilt: string = "NOT AVAILAIBLE";
  zestimate: string = "NOT AVAILAIBLE";
  zestimateCur: string = "NOT AVAILAIBLE";
  zestimateVal: string = "NOT AVAILAIBLE";
  rawData: any = [];
  finalData: any;
  weatherInfo: any;
  areaName: any;
  lawnAreaPercentage: number = 100;
  propertyLotSize: number = 3500;
  propertyLawnSize: number = 3500;
  lat: number;
  lng: number;

  constructor(private apiService: ApiService, private dataService: DataService, private zillowService: ZillowService, private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private userService: UserService, private mailChimpsService: MailchimpsService) {
    this.dataService.clearLatLong();
    // this.dataService.getLatLng();
    // this.lat = this.dataService.lat;
    // this.lng = this.dataService.lng;
    // if (this.userService.isAuth() && (this.lat && this.lng)) {
    //   this.loading = true;
    //   this.router.navigate(['/my-account']);
    // } else {
    //   localStorage.removeItem("weatherInfo");
    //   localStorage.removeItem("finalData");
    //   this.dataService.clearLatLong();
    // }

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.createPasswordForm = this.fb.group({
      password: [null, Validators.required]
    });

    this.loginForm = this.fb.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });

    this.forgotForm = this.fb.group({
      forgotemail: ['', [Validators.required, Validators.email]],
    });

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
  }

  emailOn() {
    this.emailShowContent = true;
    this.createPasswordShowContent = false;
    this.loginShowContent = false;
    this.forgotShowContent = false;
  }

  forgotOn() {
    this.router.navigate(['/forgot-password']);
    // this.emailShowContent = false;
    // this.createPasswordShowContent = false;
    // this.loginShowContent = false;
    // this.forgotShowContent = true;
  }

  /* Check email and redirect to login screen */
  goLogin() {
    this.isSubmited = false;
    if (this.emailForm.invalid) {
      this.isSubmited = true;
      return;
    }

    //for mail chimp API
    var postMailChimpsData = {
      "email_address": this.emailForm.value.email,
      "FNAME": "Sunday",
      "LNAME": "Subscribe",
      //"address": JSON.parse(localStorage.getItem('full_address'))
    }
    console.log("postMailChimpsData", postMailChimpsData);
    this.mailChimpsService.updateCustomerSubscriber(postMailChimpsData).subscribe(mailres => {
      console.log("mailres", mailres)
    });

    this.loading = true;
    var email = this.emailForm.value.email;
    this.localemail = email;
    //this.createPasswordForm.value.email=email;

    if (email !== "") {
      this.loading = true;
      this.userService.checkEmailRegister(email).subscribe(res => {
        this.loading = false;
        if (res.length > 0) {
          this.userID = res[0].id;
          this.userName = res[0].email;
          this.isSubmited = false;
          this.emailForm.reset();
          //Check if password alreday created/or not
          if (res[0].password_created) {
            this.createPasswordShowContent = false;
            this.emailShowContent = false;
            this.loginShowContent = true;
          } else {
            this.createPasswordShowContent = true;
            this.emailShowContent = false;
            this.loginShowContent = false;
          }
          localStorage.setItem('userId', JSON.stringify(this.userID));
          localStorage.setItem('emailId', JSON.stringify(this.userName));

        } else {
          this.loading = true;
          var postData = {
            "email": this.emailForm.value.email,
            "password": "thisland",
            "admin": false,
            "user_Profile": []
          }
          this.userService.registerUser(postData).subscribe(resp => {
            this.loading = false;
            this.isSubmited = false;
            this.emailShowContent = false;
            this.createPasswordShowContent = true;
            this.loginShowContent = false;
            this.userID = resp.id;
            this.userName = resp.email;
            localStorage.setItem('userId', JSON.stringify(this.userID));
            localStorage.setItem('emailId', JSON.stringify(this.userName));
          }, err => {
            this.loading = false;
            this.msgs = [];
            if (err.status == 400) {
              this.msgs.push({ severity: 'error', summary: 'Error Message', detail: JSON.parse(err._body).email[0] });
            } else {
              this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
            }
          });
        }

      }, err => {
        this.loading = false;
        this.msgs = [];
        if (err.status == 400) {
          this.msgs.push({ severity: 'error', summary: 'Error Message', detail: JSON.parse(err._body).email[0] });
        } else {
          this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
        }
      });
    }
  }

  goCreatePassword() {
    this.isSubmitedPass = false;
    this.createPasswordForm.value.email = this.localemail;
    if (this.createPasswordForm.invalid) {
      this.isSubmitedPass = true;
      return;
    }
    var useremail = JSON.parse(localStorage.getItem('emailId'));
    this.loading = false;
    var postData = {
      "password": this.createPasswordForm.value.password,
      "password_created": true,
      "admin": false,
      "active": true
    }

    this.userService.updatePassword(postData, this.userID).subscribe(resp => {
      this.loading = false;
      this.isSubmited = false;
      this.loginForm.patchValue({
        username: this.createPasswordForm.value.email,
        password: this.createPasswordForm.value.password,
        invalid: false
      });
      this.login();
    }, err => {
      this.loading = false;
      this.msgs = [];
      if (err.status == 400) {
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: JSON.parse(err._body).email[0] });
      } else {
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: DEFAULT_API_ERR });
      }
    });
  }


  /*Authorize of admin user
    @param: NULL
  */
  login() {
    this.isSubmitedLog = false;
    this.loginForm.patchValue({
      username: this.userName,
      password: this.loginForm.value.password
    });
    if (this.loginForm.invalid) {
      this.isSubmitedLog = true;
      return;
    }
    this.loading = true;
    this.userService.login(this.loginForm.value).subscribe(res => {
      var setData = {};
      if (res.status === 401) {
        this.msgs = [];
        this.msgs.push({ severity: 'error', summary: 'Error Message', detail: "Invaid Credentials." });
      }
      else {
        //Call intercom API
        this.userService.registerIntercom(this.loginForm.value.username).subscribe(resp => {
        }, err => {
        });
        setData = res;
        this.userService.getUserProfileByEmail(this.loginForm.value.username).subscribe(resp => {
          var profileObj = {};
          if (resp[0].user_Profile.length > 0) {
            profileObj = {
              "id": resp[0].id,
              "email": resp[0].email,
              "user_type": resp[0].user_Profile[0].user_type,
              "first_name": resp[0].user_Profile[0].first_name,
              "last_name": resp[0].user_Profile[0].first_name,
              "userProfile": true,
              "full_name": resp[0].user_Profile[0].first_name + " " + resp[0].user_Profile[0].last_name
            }
          } else {
            profileObj = {
              "id": resp[0].id,
              "email": resp[0].email,
              "user_type": "Lead",
              "first_name": "",
              "last_name": "",
              "userProfile": false,
              "full_name": "",
            };
          }
          res = Object.assign(setData, profileObj);
          this.userService.setSession(res);

          this.userService.getLawnInfo(resp[0].id).subscribe(response => {
            if (response.length) {
              var componentForm = {
                street_number: response[0].street_number,
                route: response[0].route,
                locality: response[0].locality,
                administrative_area_level_1: response[0].administrative_area_level_1,
                country: response[0].country,
                postal_code: response[0].postal_code
              };
              this.areaName = response[0].address;
              localStorage.setItem('addressObj', JSON.stringify(componentForm));
              localStorage.setItem('lawanID', JSON.stringify(response[0].id));
              localStorage.setItem('area', JSON.stringify(response[0].route));
              localStorage.setItem('full_address', JSON.stringify(response[0].address));

              //Get Lat long using address
              if (response[0].lat !== "0.0000000000000000" && response[0].lng !== "0.0000000000000000") {
                let center = {
                  'lat': parseFloat(response[0].lat),
                  'lng': parseFloat(response[0].lng)
                }
                this.lat = parseFloat(response[0].lat);
                this.lng = parseFloat(response[0].lng);
                localStorage.setItem('latlng', JSON.stringify(center));
              } else {
                //Commented as we need to get weather API data, lat/long for old
                //users before WDT was implemented

                // var geocoder = new google.maps.Geocoder();
                // var address = this.areaName;
                // geocoder.geocode({ 'address': address }, (results, status) => {

                //   console.log("results", results);
                //   console.log("status", status);

                //   if (status == google.maps.GeocoderStatus.OK) {
                //     var latitude = results[0].geometry.location.lat();
                //     var longitude = results[0].geometry.location.lng();
                //     let center = {
                //       'lat': latitude,
                //       'lng': longitude
                //     }
                //     this.lat = parseFloat(latitude);
                //     this.lng = parseFloat(longitude);
                //     localStorage.setItem('latlng', JSON.stringify(center));
                //   }
                // });
              }
              setTimeout(() => {
                if (this.lat && this.lng) {
                  this.loadApiData();
                } else {
                  this.loading = false;
                  this.router.navigate(['/add-lawn-address']);
                }
              }, 2000);
            } else {
              this.loading = false;
              this.router.navigate(['/add-lawn-address']);
            }
          }, err => {
            this.msgs = [];
            this.loading = false;
            this.router.navigate(['/add-lawn-address']);
          });
        }, err => {
          this.msgs = [];
          this.loading = false;
          this.msgs.push({ severity: 'error', summary: 'Error Message', detail: "Some Error Occured. Please try agin!" });
          this.router.navigate(['/login']);
        });
      }
    }, err => {
      this.msgs = [];
      this.loading = false;
      this.msgs.push({ severity: 'error', summary: 'Error Message', detail: "Invaid Credentials." });
    });
  }

  /*Get Climate analysis information
   @param NULL    
 */
  loadApiData() {
    async.waterfall([
      (callback1) => {
        this.getZillowInfo();
        callback1(null);
      },
      (callback2) => {
        let path = `?lat=${this.lat}&long=${this.lng}`;
        this.apiService.getAnalysisData(path, this.callbackAnalysisData);
        setTimeout(() => {
          callback2(null);
        }, 2000);
      },
    ], (err) => {
      if (!err) {
        console.log("All API Proccessed Success", err);
      } else {
        console.log("All API Proccessed Error", err);
      }
      this.loading = false;
      if (localStorage.getItem('reffererURL') !== "") {
        this.router.navigate(['my-account']);
      } else {
        this.router.navigate(['my-account']);
      }
    });
  }

  /* Fn called to get soil info */
  callbackAnalysisData = (response) => {
    if (response.status) {
      this.dataService.setSoilInfo(response.data, true);
    } else {
      this.dataService.setSoilInfo([], false);
    }
  }

  /*Fn called to get property Lawn Size information using zilliow API
    @param NULL
  */
  getZillowInfo() {
    var localStorageInfo = localStorage;
    this.zillowService.getZillowInfo(localStorageInfo).subscribe(res => {
      var parsedJson = JSON.parse(res);


      if (parsedJson['SearchResults:searchresults'].message.code == "0") {
        if (parsedJson['SearchResults:searchresults'].response.results.result.finishedSqFt) {
          this.finishedSquareFootage = '' + parsedJson['SearchResults:searchresults'].response.results.result.finishedSqFt;
        }

        if (parsedJson['SearchResults:searchresults'].response.results.result.yearBuilt) {
          this.yearBuilt = '' + parsedJson['SearchResults:searchresults'].response.results.result.yearBuilt;
        }

        if (parsedJson['SearchResults:searchresults'].response.results.result['zestimate']) {
          this.zestimateCur = '' + parsedJson['SearchResults:searchresults'].response.results.result['zestimate'].amount["#text"];
          this.zestimateVal = '' + parsedJson['SearchResults:searchresults'].response.results.result['zestimate'].amount["#text"];
          this.zestimate = this.zestimateVal + "/" + this.zestimateCur;
        }

        if (parsedJson['SearchResults:searchresults'].response.results.result.noOfFloors) {
          this.noOfFloors = '' + parsedJson['SearchResults:searchresults'].response.results.result.noOfFloors;
        }

        if (parsedJson['SearchResults:searchresults'].response.results.result.basement) {
          this.basement = '' + parsedJson['SearchResults:searchresults'].response.results.result.basement;
        }
        var getlawnAreaSize = parseInt(parsedJson['SearchResults:searchresults'].response.results.result.lotSizeSqFt);
        if (getlawnAreaSize) {
          this.propertyLotSize = getlawnAreaSize;
          //changes w.e.f 19 sep,2018
          if (this.propertyLotSize < 20000) {
            var calculateLawnAreaSize = (-0.0000000014 * Math.pow(getlawnAreaSize, 3)) + (0.0000528264 * Math.pow(getlawnAreaSize, 2)) + ((0.1484711789 * getlawnAreaSize) - 207.1826625378);
            if (calculateLawnAreaSize > 0) {
              this.propertyLawnSize = Math.ceil(calculateLawnAreaSize);
            } else {
              this.propertyLawnSize = 3500;
            }
          } else if (this.propertyLotSize >= 20000) {
            var calculateLawnAreaSize = (0 * Math.pow(getlawnAreaSize, 3)) - (0.0000011756 * Math.pow(getlawnAreaSize, 2)) + ((0.27056515 * getlawnAreaSize) + 11698.6584107335);
            if (calculateLawnAreaSize > 0) {
              this.propertyLawnSize = Math.ceil(calculateLawnAreaSize);
            } else {
              this.propertyLawnSize = 3000;
            }
          }
          let lawnAreaPercentage = (-0.002224077 * Math.pow((getlawnAreaSize / 1000), 2) + (0.0751121572 * (getlawnAreaSize / 1000) - 0.0061433142));
          this.lawnAreaPercentage = lawnAreaPercentage;
          //this.propertyLawnSize = Math.ceil(getlawnAreaSize * lawnAreaPercentage);
          this.dataService.setArea(this.propertyLotSize, this.lawnAreaPercentage, this.propertyLawnSize, this.finishedSquareFootage, this.noOfFloors, this.basement, this.yearBuilt, this.zestimate);
        } else {
          this.dataService.setArea(this.propertyLotSize, this.lawnAreaPercentage, this.propertyLawnSize, this.finishedSquareFootage, this.noOfFloors, this.basement, this.yearBuilt, this.zestimate);
        }
      } else {
        this.dataService.setArea(this.propertyLotSize, this.lawnAreaPercentage, this.propertyLawnSize, this.finishedSquareFootage, this.noOfFloors, this.basement, this.yearBuilt, this.zestimate);
      }
    }, err => {
      this.propertyLotSize = this.dataService.lot_size ? this.dataService.lot_size : this.propertyLotSize;
      this.lawnAreaPercentage = this.dataService.lawn_area_percent ? this.dataService.lawn_area_percent : this.lawnAreaPercentage;
      this.propertyLawnSize = this.dataService.lawn_size ? this.dataService.lawn_size : this.propertyLawnSize;
      this.dataService.setArea(this.propertyLotSize, this.lawnAreaPercentage, this.propertyLawnSize, this.finishedSquareFootage, this.noOfFloors, this.basement, this.yearBuilt, this.zestimate);
    });
  }

}