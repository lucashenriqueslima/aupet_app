import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-perfil-consultor',
  templateUrl: './perfil-consultor.page.html',
  styleUrls: ['./perfil-consultor.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PerfilConsultorPage implements OnInit {
  consultor;
  data: any = {};
  team = [];
  states = [];
  cities = [];
  foto;
  cnh_frente;
  cnh_verso;
  rg_frente;
  rg_verso;
  viacep;
  load;
  newSenha = [];
  senha = 'password';
	nova_senha = 'password';
	confirmar_senha = 'password';
  
  constructor(
    public appService: AppService,
    public router: Router
  ) {
  }
  ngOnInit() {
    this.data = Object.assign(this.appService.user, {});
    this.getStates();
    this.getEquipes();
    this.selectState(this.data.id_estado);
  }
  async getStates() {
    this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
  }
  async selectState(id) {
    this.appService.httpGetOffFirst(`getCities/${id || 0}`, 'hibrida').subscribe(data => {
      this.cities = data;
      if (this.viacep) this.data.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
    });
  }
  async getEquipes() {
    this.appService.httpGetOffFirst(`getEquipes`).subscribe(team => this.team = team);
  }
  async cepKeyUp(evt) {
    evt.stopPropagation();
    let cep: string = evt.target.value && evt.target.value.match(/\d+/g).join("");
    if (cep.length > 7) {
      this.data.cep = cep.substring(0, 8);
      let viacep = new ViaCep({ type: 'json' });
      let address = viacep.zipCod.getZip(cep);
      address.then(data => data.json()).then(data => {
        this.viacep = data;
        this.data.id_estado = this.states.find(x => x.uf == this.viacep.uf).id;
        this.data.bairro = this.viacep.bairro;
        this.data.rua = this.viacep.logradouro;
        this.data.complemento = this.viacep.complemento;
        this.selectState(this.data.id_estado);
      });
    }
  }
  async inputfoto() {
    let dataURL = await this.appService.getImageBase();
    this.data.foto = dataURL;
  }
  async inputRgFrente() {
    let dataURL = await this.appService.getImageBase();
    this.data.consultor.rg_frente = dataURL;
  }
  async inputRgVerso() {
    let dataURL = await this.appService.getImageBase();
    this.data.consultor.rg_verso = dataURL;
  }
  async inputCnhFrente() {
    let dataURL = await this.appService.getImageBase();
    this.data.consultor.cnh_frente = dataURL;
  }
  async inputCnhVerso() {
    let dataURL = await this.appService.getImageBase();
    this.data.consultor.cnh_verso = dataURL;
  }
  async request() {
    try {
      this.load = true;
      var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
      // if (!this.data.nome || !this.data.cpf  || !this.data.telefone ) throw 'Preencha os Dados do Consultor';
      // if ( this.data.cpf.length < 14 || this.data.telefone.length < 15 || this.data.telefone2 != null && this.data.telefone2.length < 14 ) {
      //        if (this.data.nome.length < 3) {
      //          this.appService.showAlert(null, 'O tamanho mínimo do Nome é 3 caracteres.');
      //        } else if (this.data.cpf.length < 14) {
      //          this.appService.showAlert(null, 'Digite o Cpf completo.');
      //        } else if (this.data.telefone.length < 15) {
      //          this.appService.showAlert(null, 'Digite o Telefone/Whatsapp completo.');
      //        } else if (this.data.telefone2 != null && this.data.telefone1.length < 14) {
      //          this.appService.showAlert(null, 'Digite o Telefone secundário completo.');
      //        }
      //  } 
      //  if(this.data.foto ==" ") throw 'A Foto de Perfil é obrigatório';
      // //  this.appService.showAlert(null, 'A Foto de Logo é obrigatório');
      //  else if (!reg.test(this.data.email)) throw 'O E-mail digitado é inválido';
      //  else if (this.data.segundo_email != null && !reg.test(this.data.segundo_email)) throw 'O Segundo E-mail digitado é inválido';
      //  else if (!this.data.rua || !this.data.id_estado || !this.data.id_cidade || !this.data.numero || !this.data.bairro ) throw 'Digite as Informações de Localização';
      if (this.data.novaSenha) {
        if (this.data.novaSenha != this.data.novaSenha2) throw 'Senhas divergentes';
      }
      let retorno = await this.appService.httpPut('consultor/atualizar', this.data);
      this.appService.user = this.data;
      this.appService.storage.set(`user`, this.appService.user);
      this.appService.showToast('Perfil alterado com sucesso', 10000);
      window.history.back();
    } catch (e) {
      this.appService.errorHandler(e);
    } finally {
      this.load = false;
    }
  }

  mudar_visibilidade(i) {
		if(i == 1){
			if (this.senha == 'password') {
				this.senha = 'text';
			} else {
				this.senha = 'password';
			}
		}
		if(i == 2){
			if (this.nova_senha == 'password') {
				this.nova_senha = 'text';
			} else {
				this.nova_senha = 'password';
			}
		}
		if(i == 3){
			if (this.confirmar_senha == 'password') {
				this.confirmar_senha = 'text';
			} else {
				this.confirmar_senha = 'password';
			}
		}
	}
}
