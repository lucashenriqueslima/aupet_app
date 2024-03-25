import { Component, OnInit, ViewEncapsulation ,ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SelecionarEspecialidadeComponent } from './../../modal/selecionar-especialidade/selecionar-especialidade.component';
import { AppService } from 'src/app/services/app.service';
import ViaCep from 'node-viacep';
@Component({
  selector: 'app-perfil-clinica',
  templateUrl: './perfil-clinica.page.html',
  styleUrls: ['./perfil-clinica.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PerfilClinicaPage {
  data: any = {};
  params : any = {};
  selecionadas = [];
  states = [];
  cities = [];
  clinica;
  viacep;
  newImages = [
    '',
    '',
    '',
    '',
    '',
    '',
  ];
  images = []; 
  load= false;
  newlogo;
  senha = 'password';
	nova_senha = 'password';
	confirmar_senha = 'password';
  
  constructor(
    public appService: AppService,
    public modalController: ModalController
  ){
    this.clinica = this.appService.user;
    this.getEspecialidades();
    this.getStates();
    this.getSelecionadas();
    this.getImageOld();
  }
  
  ngOnInit(){
    this.dataAlter();
    this.selectState(this.clinica.id_estado);
    // console.log(this.clinica);

  }

  async open_modal_especialidade() {
		const modal = await this.modalController.create({
			component: SelecionarEspecialidadeComponent,
			componentProps: { especialidades: this.params },
		 });
     await modal.present();
     let selecionadas = await modal.onDidDismiss();
    //  debugger
     this.selectEspecialidades(selecionadas.data);
  }

  async getEspecialidades(){
    this.appService.httpGetOffFirst(`getEspecialidades`).subscribe(data => this.params = data);
  }

  selectEspecialidades(esp){
    for (let index = 0; index < esp.length; index++) {
      this.selecionadas.push(this.params.find(item =>  item.id == esp[index]));
    }
  }

  async getStates() {
    this.appService.httpGetOffFirst(`getStates`).subscribe(states => this.states = states);
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

  async selectState(id) {
		this.appService.httpGetOffFirst(`getCities/${id || 0}`,).subscribe(data => {
			this.cities = data;
			if (this.viacep) this.data.id_cidade = this.cities.find(x => x.cidade == this.viacep.localidade).id;
		});
  }

  async dataAlter(){
    this.data = this.clinica;
  }

 //Remover uma especialidade 
  deleteSelecionado(i){
    this.selecionadas.splice(i,1);
  }

  // Buscar as especialidades da Clinica 
  async getSelecionadas (){
    this.selecionadas  = await this.appService.httpGet(`clinica/findEspecialidades`);
  }

  //Buscar as imagens atua da clinica 
  async getImageOld(){
    let data = await this.appService.httpGet(`clinica/getImages`);
      for(let index = 0; index < data.length; index++){
        this.images[index] = data[index].url;
      }
    //console.log(this.images);
  }

  //inserir nova logo 
  async inputlogo(){
    let dataURL = await this.appService.getImageBase();
    this.data.clinica.logo = dataURL;
    // this.clinica.logo = dataURL; 
    this.newlogo = dataURL;
  }

  //inseri novas imagens 
  async getImages(i){
    let dataURL = await this.appService.getImageBase();
    this.newImages[i]= dataURL;
    this.images[i]=dataURL;
  }

  async request(){
		try {
			 this.load = true;
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        if (!this.data.nome) throw 'Preencha os Campos obrigatorios';
        if ( this.data.clinica.cnpj.length < 17 || this.data.telefone.length < 15 || this.data.telefone2 != null && this.data.telefone2.length < 14 ) {
               if (this.data.nome.length < 3) {
                 this.appService.showAlert(null, 'O tamanho mínimo do Nome é 3 caracteres.');
               } else if (this.data.clinica.cnpj.length < 17) {
                 this.appService.showAlert(null, 'Digite o CNPJ completo.');
               } else if (this.data.telefone.length < 15) {
                 this.appService.showAlert(null, 'Digite o Telefone/Whatsapp completo.');
               } 
         } 
          
         if (!reg.test(this.data.email)) throw 'O E-mail digitado é inválido';
         else if (!this.data.rua || !this.data.id_estado || !this.data.id_cidade || !this.data.numero || !this.data.bairro ) throw 'Digite as Informações de Localização';
         if(this.data.newsenha){ 
          if (this.data.newsenha != this.data.passrepeat) throw 'Senhas divergentes'; 
          this.data.senha = this.data.newsenha;
        }
        if(this.newImages)this.data.images = this.newImages;
        
        this.data.especialidades = this.selecionadas;
  
        let retorno = await this.appService.httpPut('clinica/atualizar', this.data);
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
