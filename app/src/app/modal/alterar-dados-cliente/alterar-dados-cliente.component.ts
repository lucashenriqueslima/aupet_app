import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from '../../services/app.service';
@Component({
  selector: 'app-alterar-dados-cliente',
  templateUrl: './alterar-dados-cliente.component.html',
  styleUrls: ['./alterar-dados-cliente.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlterarDadosClienteComponent implements OnInit {
  constructor(
    public modalCtrl: ModalController,
    public navParams: NavParams,
    public modalController: ModalController,
    public route: ActivatedRoute,
    public appService: AppService,
  ) { }
  data;
  proposta;
  load;
  async ionViewDidEnter() {
    this.data = this.navParams.data.pessoa;
    this.proposta = this.navParams.data.proposta;
  }

  ngOnInit() {
    this.ionViewDidEnter();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
  async salvar() {
    try {
      this.load = true;
      let dadosAlter = {
        'id': this.data.id,
        'nome': this.data.nome,
        'email': this.data.email,
        'telefone': this.data.telefone
        }
      await this.appService.httpPut('proposta/dadosAssociado', dadosAlter);
      this.appService.showToast('Dados alterados com sucesso', 3000);
      this.modalCtrl.dismiss();
      this.appService.events.upDetailLead.emit();
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      this.load = false;
    }
  }
}
