import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clinica-mapa',
  templateUrl: './clinica-mapa.component.html',
  styleUrls: ['./clinica-mapa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClinicaMapaComponent implements OnInit {

  clinica; 
  images: [];
  constructor(
    public modalCtrl: ModalController, 
    public navParams : NavParams,
    public appService: AppService,
    private router: Router
  ){
    this.clinica = this.navParams.data.clinica;
   }
   ngOnInit(){

  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  info_clinica(id){   
      this.dismiss();
      this.router.navigateByUrl('/associado/clinica/'+id);
  }

}
