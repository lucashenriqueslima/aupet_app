import { AppService } from '../services/app.service';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ModalController } from '@ionic/angular';
//MODAL
import { SelecionarTipoUsuarioComponent } from './../modal/selecionar-tipo-usuario/selecionar-tipo-usuario.component';
import { SelecionarTipoCadastroComponent } from './../modal/selecionar-tipo-cadastro/selecionar-tipo-cadastro.component';
import { RecuperarSenhaComponent } from './../modal/recuperar-senha/recuperar-senha.component';
import { NotificationService } from '../services/notification.service';
@Component({
	selector: 'app-login',
	templateUrl: './login.page.html',
	styleUrls: ['./login.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class LoginPage implements OnInit {
	public password_input = 'password';
	public animate = true;
	data: any = {};
	load = false;
	tipoCampoSenha: boolean = false;
	constructor(
		public modalController: ModalController,
		public appService: AppService,
		public notServ: NotificationService,
	) { }
	ngOnInit() {
		if (!this.appService.enviroment.production) this.data = { email: "" };
	}
	params: any = {};
	async open_modal_tipo() {
		const modal = await this.modalController.create({
			component: SelecionarTipoUsuarioComponent,
			componentProps: { User: this.data },
		});
		await modal.present();
		let tipoLogin = await modal.onDidDismiss();
		// this.login(tipoLogin.data);
	}
	mudar_visibilidade() {
		if (this.password_input == 'password') {
			this.password_input = 'text';
		} else {
			this.password_input = 'password';
		}
	}
	async open_modal_tipo_cadastro() {
		const modal = await this.modalController.create({
			component: SelecionarTipoCadastroComponent,
			componentProps: { tipo: "cadastro" },
		});
		return await modal.present();
	}
	async open_modal_recuperar_senha() {
		const modal = await this.modalController.create({
			component: RecuperarSenhaComponent,
			componentProps: {},
		});
		return await modal.present();
	}
	async login() {
		try {
			let ambiente = 3;

			this.load = true;
			let data = await this.appService.httpPost(`login`, this.data);

			if(!data.data.associado) --ambiente;
			if(!data.data.consultor) --ambiente;
			if(!data.data.clinica) --ambiente;

			if(ambiente == 1){
				var url = this.getAmbiente(data.data);
			}else {
				const modal = await this.modalController.create({ component: SelecionarTipoUsuarioComponent, componentProps: { login: data }, });
				await modal.present();
				var result = (await modal.onDidDismiss()).data;
				if (!result) return;
			}

			
			await this.appService.storage.set(`user`, data.data);
			this.appService.user = data.data;
			await this.appService.storage.set(`access_token`, data.token);
			if(ambiente ==  1) this.appService.navigateUrl(url);else this.appService.navigateUrl(result.url) ;
			this.notServ.statusPermissao();
			this.notServ.getToken();
		} catch (e) {
			if(e?.status == 460) { 
				this.appService.showConfirm(null,e.error,this.data); 
			}
			else this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}

	getAmbiente(data){
		if(data?.associado) return '/associado';
		if(data?.consultor) return '/consultor';
		if(data?.clinica) return '/clinica';
	}
}