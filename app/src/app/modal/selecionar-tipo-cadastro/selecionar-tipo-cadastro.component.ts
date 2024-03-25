import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppService } from './../../services/app.service';


@Component({
  selector: 'app-selecionar-tipo-cadastro',
  templateUrl: './selecionar-tipo-cadastro.component.html',
  styleUrls: ['./selecionar-tipo-cadastro.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelecionarTipoCadastroComponent implements OnInit {

  // inputValue: string = "";
  public tipo_user: any;
  data: any = {};
  tipo: any = {};
  tipo_usuario = 0;


  constructor(
    public appService: AppService,
    public modalCtrl: ModalController, 
    private router: Router 
  ) { }

  ngOnInit() {
  }

  dismiss() {
    this.modalCtrl.dismiss({
      'dismissed': true
    });
  }
  async mudar_pagina() {
    var elements = document.getElementsByName('tipo_user');
    var url;
    var tp;
    elements.forEach(e => {
      if (e['checked']) {
          if(e['defaultValue'] == 1){
             tp = 1 
            url= "/cadastro/usuario";
          }else if (e['defaultValue'] == 2){
             tp = 2   
            url= "/cadastro/consultor";
          }else if( e['defaultValue'] == 3){
             tp = 3   
            url= "/cadastro/clinica";
          }
       }
    });
    this.dismiss();
    if(tp > 0){
      this.router.navigateByUrl(url);
    }else{
      alert('tipo não encontrado');
      this.router.navigateByUrl("login");
    }
  }



}
