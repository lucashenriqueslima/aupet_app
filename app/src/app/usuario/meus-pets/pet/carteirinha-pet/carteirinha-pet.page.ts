import { element } from 'protractor';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/services/app.service';
import { Keyboard } from '@awesome-cordova-plugins/keyboard/ngx';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-carteirinha-pet',
  templateUrl: './carteirinha-pet.page.html',
  styleUrls: ['./carteirinha-pet.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CarteirinhaPetPage implements OnInit {
  pet: any = {};
  exames : any = {};
  vacinas : any = {};
  vermifungos : any = {};
  banhos : any = {};
  medicamentos : any = {};
  template;

  constructor(
    public modalController: ModalController,
    public appService: AppService,
    public route: ActivatedRoute,
    private actionSheetCrtl: ActionSheetController,
  ) { }

  ngOnInit() {
    this.getPet();
  }

  async getPet(){
    this.pet = await this.appService.httpGet('pet/getPet/'+ this.route.snapshot.params.id);
  }

  async compartilhar() {
		try {
      let data = await this.appService.httpGet('pet/montarCarterinha/'+ this.route.snapshot.params.id);
			let urlFile = data.url;
			let actionSheet: any = await new Promise(async resolve => {
				let btnActions = [];
				btnActions.push({ text: 'Compartilhar', handler: () => resolve('pdf') });
        btnActions.push({ text: 'Visualizar', handler: () => resolve('ver') });
				btnActions.push({ text: 'Cancelar', role: 'cancel' });
				await (await this.actionSheetCrtl.create({ header: 'Ações', buttons: btnActions })).present()
			});
			if (actionSheet == 'pdf') {
				if (this.appService.platform.is('cordova')) {
					await this.appService.socialSharing.share(`Caterinha do Pet-${this.pet.nome}` , `Caterinha do Pet-${this.pet.nome}`, urlFile);
				} else {
					let msg = `Este é o link para sua Carterimha em PDF\n ${urlFile}`;
					this.appService.sharedMsg(msg);
				}
			} else {
				window.open(urlFile, '_blank');
			}
		} catch (e) {
			this.appService.sharedMsg('Erro Ao Gera Carterinha');
		}
	}

  backPage() {
    window.history.back();
  }

}
