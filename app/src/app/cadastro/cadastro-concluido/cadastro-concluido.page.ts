import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';
@Component({
	selector: 'app-cadastro-concluido',
	templateUrl: './cadastro-concluido.page.html',
	styleUrls: ['./cadastro-concluido.page.scss'],
	encapsulation: ViewEncapsulation.None,
})
export class CadastroConcluidoPage implements OnInit {
	text = {
		titulo: "Cadastro realizada com sucesso!",
		paragrafo: "Seu cadastro foi enviado para aprovação. Aguarde nosso contato."
	}
	cadastro;
	constructor(
		public appService: AppService,
		public activatedRoute: ActivatedRoute,
	) { }
	ngOnInit() {
	    this.cadastro = this.activatedRoute.snapshot.params.cadastro;
		if (this.cadastro == 'consultor') {
			this.text.paragrafo = "Seu cadastro foi enviado para aprovação. Aguarde nosso contato.";
		}
		if (this.cadastro == 'adesao') {
			this.text.paragrafo = "Foi Solicitado a Adesão. Aguarde nosso contato.";
		}

	}
}
