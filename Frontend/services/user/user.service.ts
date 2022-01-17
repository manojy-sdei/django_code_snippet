import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/throw';

import { Router } from '@angular/router';
import { API_BASE } from '../../constants/constants';
import { API_URL } from '../../constants/constants';
import { API_TOKEN } from '../../constants/constants';

@Injectable()
export class UserService {
  showInfoFlag: boolean = false;

  constructor(private http: Http, private router: Router) {
  }

  private headers = new Headers({ 'Content-Type': 'application/json' });
  private apiURL = API_URL;
  private apiBase = API_BASE;


  /*Register user
    @param: postData
  */
  registerUser(postData): Observable<any> {
    return this.http.post(this.apiURL + '/user/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /*Register Intercom
    @param: postData
  */
  registerIntercom(email): Observable<any> {
    return this.http.get(this.apiURL + '/intercomapi/' + email + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  updateUserActive(postData): Observable<any> {
    return this.http.post(this.apiURL + '/user_active/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*UpdatePassword user
    @param: postData
  */
  updatePassword(postData, ID): Observable<any> {
    return this.http.put(this.apiURL + '/usertype/' + ID + '/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Get email exsist check
    @param: email
  */
  checkEmailRegister(email): Observable<any> {
    return this.http.get(this.apiURL + '/user/?email=' + email, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /*Forgot user
    @param: postData
  */
  forgotUser(postData): Observable<any> {
    return this.http.post(this.apiURL + '/user/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Authenticate users
    @param: postData
  */
  login(postData): Observable<any> {
    var postsData = 'client_id=' + API_TOKEN.client_id + '&client_secret=' + API_TOKEN.client_secret + '&grant_type=password&username=' + postData.username + '&password=' + postData.password;
    return this.http.post(this.apiBase + '/o/token/', postsData, { headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }) })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Add Lawn address
    @param: postData
  */

  saveLawanAddress(postData): Observable<any> {
    return this.http.post(this.apiURL + '/lawn/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Update Lawn address
      @param: LawnObj
    */
  updateLawanAddress(lawnObj, cLawnID): Observable<any> {
    return this.http.put(this.apiURL + '/lawn/' + cLawnID + '/', JSON.stringify(lawnObj), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Add Soil address
      @param: postData
    */
  saveSoilData(postData): Observable<any> {
    return this.http.post(this.apiURL + '/soil/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Update Soil Data
    @param: LawnObj
  */

  updateSoilData(soilObj, cSoilID): Observable<any> {
    return this.http.put(this.apiURL + '/soil/' + cSoilID + '/', JSON.stringify(soilObj), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Add Climate address
     @param: postData
   */
  saveLawnClimateData(postData): Observable<any> {
    return this.http.post(this.apiURL + '/climate/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /*Update Climate Data
    @param: LawnObj
  */

  updateClimateData(climateObj, cClimateID): Observable<any> {
    return this.http.put(this.apiURL + '/climate/' + cClimateID + '/', JSON.stringify(climateObj), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Add lawn address
    @param: postData
  */
  saveLawnSoilData(postData): Observable<any> {
    return this.http.post(this.apiURL + '/soil/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  getSoilData(cLawnID): Observable<any> {
    return this.http.get(this.apiURL + '/soil/?lawn=' + cLawnID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  getClimateData(cLawnID): Observable<any> {
    return this.http.get(this.apiURL + '/climate/?lawn=' + cLawnID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /*Get users profile vy ID
    @param: ID
  */
  getUserProfile(ID): Observable<any> {
    return this.http.get(this.apiURL + '/profile/?user=' + ID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Get users profile by email
   @param: email
 */
  getUserProfileByEmail(email): Observable<any> {
    return this.http.get(this.apiURL + '/user/?email=' + email, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  getUserIDLawnID(email): Observable<any> {
    return this.http.get(this.apiURL + '/combine_user/?email=' + email, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  checkLawnExsist(id): Observable<any> {
    return this.http.get(this.apiURL + '/lawn/?user=' + id, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  checkSoilCLimateExsist(id): Observable<any> {
    return this.http.get(this.apiURL + '/combine_lawn/' + id + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Create WeatherReport
   @param: postData
  */
  postWeatherOps(postData): Observable<any> {
    return this.http.post(this.apiURL + '/weatherops/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Create WeatherReport
   @param: postData
  */
  postAvgTemp(postData): Observable<any> {
    return this.http.post(this.apiURL + '/avgtemp/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /* Create postAvgPrecip
   @param: postData
  */
  postAvgPrecip(postData): Observable<any> {
    return this.http.post(this.apiURL + '/rainfall/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }



  /* Create postAvgYearlyTemp
   @param: postData
  */
  postAvgYearlyTemp(postData): Observable<any> {
    return this.http.post(this.apiURL + '/avgtempyearly/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /* Create postAvgYearlyPrecip
   @param: postData
  */
  postAvgYearlyPrecip(postData): Observable<any> {
    return this.http.post(this.apiURL + '/rainfallyearly/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /* get WeatherReport
   @param: userId
  */
  getWeatherOps(userId): Observable<any> {
    return this.http.get(this.apiURL + '/weatherreport/' + userId + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /* get getAvgTempData
   @param: userId
  */
  getAvgTempData(userId): Observable<any> {
    return this.http.get(this.apiURL + '/avgtemp/' + userId + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* get getAvgPrecipData
     @param: userId
    */
  getAvgPrecipData(userId): Observable<any> {
    return this.http.get(this.apiURL + '/rainfall/' + userId + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /* get getYearlyTempData
   @param: userId
  */
  getYearlyTempData(userId): Observable<any> {
    return this.http.get(this.apiURL + '/avgtempyearly/' + userId + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }
  /* get getYearlyPercipData
     @param: userId
    */
  getYearlyPercipData(userId): Observable<any> {
    return this.http.get(this.apiURL + '/rainfallyearly/' + userId + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }







  getMyaccount(ID): Observable<any> {
    return this.http.get(this.apiURL + '/combine_user/' + ID + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Craete user profile
    @param: postData
  */
  createProfile(postData): Observable<any> {
    return this.http.post(
      `${this.apiURL}/profile/`, JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  /*Update user
    @param: postData
  */
  updateUser(postData): Observable<any> {
    return this.http.put(
      `${this.apiURL}/profile/${postData.profile_id}/`, JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Delete user
    @param: ID
  */
  deleteUser(ID): Observable<any> {
    return this.http.delete(`${this.apiURL}/user/${ID}/`, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Newsletter Subsription */
  subscribeNewsletter(postData): Observable<any> {
    //console.log(postData)
    return this.http.post(this.apiURL + '/newsletter/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Referral User */
  referralUser(postData): Observable<any> {
    // console.log(postData)
    return this.http.post(this.apiURL + '/referral/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Contact Form */
  contactForm(postData): Observable<any> {
    return this.http.post(this.apiURL + '/contactus/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Get email exsist check
      @param: email
    */
  checkInviteEmail(email): Observable<any> {
    return this.http.get(this.apiURL + '/invite_user/?email=' + email, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  inviteUser(postData): Observable<any> {
    return this.http.post(this.apiURL + '/invite_user/', JSON.stringify(postData), { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Invite User List */
  inviterList(invitenum): Observable<any> {
    return this.http.get(this.apiURL + '/invite_user/?invite_no=' + invitenum, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /* Invite Password List */
  invitePasswordList(password): Observable<any> {
    return this.http.get(this.apiURL + '/site_password/?password=' + password, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }


  getUserQuestions(uID): Observable<any> {
    // console.log(postData)
    return this.http.get(this.apiURL + '/user_question_option/?user=' + uID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Post lawnID
      @param: postData
  */
  getLawnInfo(ID): Observable<any> {
    return this.http.get(this.apiURL + '/lawn/?user=' + ID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Is Auth check admin
    @param: NULL
  */
  isAuth() {
    return localStorage.user_login != null;
  }

  /*Set admin session
    @param: data
  */
  setSession(data) {
    localStorage.user_login = JSON.stringify(data);
  }


  /*Read admin session
    @param: data
  */
  readSession() {
    return JSON.parse(localStorage.user_login);
  }

  /*Read admin user
    @param: NULL
  */
  logout() {
    //check show info bar
    console.log("localStorageLogout===", localStorage);
    if (localStorage.getItem('showInfoFlag') == "false") {
      this.showInfoFlag = false;
    } else {
      this.showInfoFlag = true;
    }
    delete localStorage.user_login;
    localStorage.clear();
    setTimeout(() => {
      console.log("localStorageHHHHHHhh===", localStorage);
      localStorage.setItem('showInfoFlag', JSON.stringify(this.showInfoFlag));
      let currentURL = location.pathname;
      if (currentURL == '/' || currentURL == '/home-new') {
        window.location.href = '/';
      }
      else {
        this.router.navigate(['/']);
      }
    }, 2000);
  }

  /*handle Error
   @param: error
 */
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  /*Send  forgot password information
   @param: email
 */
  forgotPassword(email): Observable<any> {
    return this.http.get(this.apiURL + '/reset_password/' + email + '/', { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Admin Change password
   @param: postData
   @param: ID
 */
  changePassword(postData): Observable<any> {
    return this.http.post(`${this.apiURL}/change_password/`, postData, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  getPreOrder(ID): Observable<any> {
    return this.http.get(this.apiURL + '/preorder/?user_id=' + ID, { headers: this.headers })
      .map(res => res.json())
      .catch((e: any) => Observable.throw(this.observErrorHandler(e)));
  }

  /*Error handling
  @param: error
*/
  observErrorHandler(error: any): void {
    return error;
  }

}
