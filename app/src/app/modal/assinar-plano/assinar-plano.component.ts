import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-assinar-plano',
  templateUrl: './assinar-plano.component.html',
  styleUrls: ['./assinar-plano.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AssinarPlanoComponent implements OnInit {

  constructor(
    public modalCtrl: ModalController,
		public navParams: NavParams,
		public appService: AppService,
  ) { }

  ngOnInit() {}

  dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}

  assinarPlano(){
    this.appService.navigateUrl(`${this.appService.ambiente}/planos/${this.navParams.data.params.id}`);
    this.dismiss();
  }
}
