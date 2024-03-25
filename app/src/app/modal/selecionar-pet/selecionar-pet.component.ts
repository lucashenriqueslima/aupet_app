import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-selecionar-pet',
  templateUrl: './selecionar-pet.component.html',
  styleUrls: ['./selecionar-pet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelecionarPetComponent implements OnInit {

  id_pet;
  pets;
  constructor(
    public modalCtrl: ModalController, 
    public navParams: NavParams,
    public appService: AppService,
    public route: ActivatedRoute,
    public http: HttpClient,
  ) { }

  ngOnInit() {
    this.getPets();
  }

  async getPets(){
    this.appService.httpGetOffFirst(`associado/getPets`).subscribe(data => { 
      this.pets = data.filter((pet) => { return pet.id_plano == null || pet.classificacao == 'arquivada' });
    },this.appService.errorHandler);
  }

  async selecionar(){
    this.modalCtrl.dismiss(this.id_pet);
  }  

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }

  createPet () {
    this.appService.navigateUrl("/associado/meus-pets/adicionar-pet");
    this.dismiss();
  }

}
