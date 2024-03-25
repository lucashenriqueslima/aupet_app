import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-verifica-existe-associado',
  templateUrl: './verifica-existe-associado.component.html',
  styleUrls: ['./verifica-existe-associado.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerificaExisteAssociadoComponent implements OnInit {

  constructor(
    public modalCtrl: ModalController,
		public navParams: NavParams
  ) { }

  ngOnInit() { }

  async continuar () {
    this.modalCtrl.dismiss('sim');
  }

  dismiss() {
		this.modalCtrl.dismiss({
			'dismissed': true
		});
	}
}
