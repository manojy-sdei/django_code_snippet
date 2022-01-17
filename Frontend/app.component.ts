import { Component, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  title = 'app';
  constructor(private router: Router) {
   
  }
  ngAfterViewInit() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        if (e.url == "/my-account" || e.url == "/your-lawn") {
          localStorage.setItem('reffererURL', e.url);
        } else if (e.url !== "/welcome-back") {
          localStorage.setItem('reffererURL', "");
        }
      }
    });
  }
}

