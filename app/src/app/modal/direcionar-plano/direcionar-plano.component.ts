import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-direcionar-plano',
  templateUrl: './direcionar-plano.component.html',
  styleUrls: ['./direcionar-plano.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DirecionarPlanoComponent implements OnInit {

  pet;
  constructor(
   public modalCtrl: ModalController, 
   public appService: AppService,
   public navParams: NavParams,
  ) { }

  ngOnInit() {
    this.pet = this.navParams.data.pet;
    // console.log(this.pet);
  }

  planos() {
    this.appService.navigateUrl(`${this.appService.ambiente}/planos`);
    this.dismiss();
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
}
