import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-clinica',
  templateUrl: './home-clinica.page.html',
  styleUrls: ['./home-clinica.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeClinicaPage implements OnInit {

  constructor(
    public appService: AppService,
    public router : Router

  ) { }

  animate = false;
	ionViewDidEnter(){ this.animate = true; }

  ngOnInit() {
  }


  async logout(){
    this.appService.notAuth();
 }

}
