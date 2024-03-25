import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class HomePage implements OnInit {
	foto;
	pets = [];
	notificacoes;

	constructor(
		public appService: AppService,
	) { }
	ngOnInit() {
		this.foto = this.appService.user?.foto;
		this.getPets();
	}

	animate = false;
	ionViewDidEnter(){ this.animate = true; }
	
	async logout() {
		this.appService.notAuth();
	}
	async getPets() {
		await this.appService.httpGetOffFirst(`associado/getPets`).subscribe(data => { 
			this.pets = data; 
			this.notificacoes = 0;
			this.pets.forEach((pet) => {
				pet.cirurgias.forEach((cirurgia) => {
					let agendamento = new Date(cirurgia.data_hora);
					let hoje = new Date();
					if((cirurgia.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.banhos.forEach((banho) => {
					let agendamento = new Date(banho.data_banho);
					let hoje = new Date();
					if((banho.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.consultas.forEach((consulta) => {
					let agendamento = new Date(consulta.data_agendamento);
					let hoje = new Date();
					if((consulta.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.exames.forEach((exame) => {
					let agendamento = new Date(exame.data);
					let hoje = new Date();
					if((exame.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.internacoes.forEach((internacao) => {
					let agendamento = new Date(internacao.data_agendamento);
					let hoje = new Date();
					if((internacao.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.medicamentos.forEach((medicamento) => {
					let agendamento = new Date(medicamento.data_agendamento);
					let hoje = new Date();
					if((medicamento.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.vacinas.forEach((vacina) => {
					let agendamento = new Date(vacina.data_vacina);
					let hoje = new Date();
					if((vacina.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
				pet.vermifungos.forEach((vermifungo) => {
					let agendamento = new Date(vermifungo.data_vermifungo);
					let hoje = new Date();
					if((vermifungo.status == 'Agendado') && (agendamento.toLocaleDateString() == hoje.toLocaleDateString())) this.notificacoes++;
				})
			});
		}, this.appService.errorHandler);
		
	}
}