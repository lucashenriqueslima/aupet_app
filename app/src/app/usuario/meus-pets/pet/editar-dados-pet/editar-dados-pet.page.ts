import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-editar-dados-pet',
  templateUrl: './editar-dados-pet.page.html',
  styleUrls: ['./editar-dados-pet.page.scss'],
	encapsulation: ViewEncapsulation.None
})
export class EditarDadosPetPage implements OnInit {

	pet: any = {};
	racas = [];
	especies = [];
	planos = [];
  sexo;
	load;

  constructor(
		public route: ActivatedRoute,
		public appService: AppService,
  ) { }

  async ngOnInit() {
    this.selectEspecies();
		this.selectPlanos();
    await this.getPet()
		this.selectRaca(this.pet.id_especie);
  }

  async getPet(){
    this.pet = await this.appService.httpGet('pet/getPet/'+ this.route.snapshot.params.id_pet);
  }

  selectRaca(id) {
		this.appService.httpGetOffFirst(`getRaca/${id}`).subscribe(data => {
			this.racas = data;
		});
	}
  async selectEspecies() {
		this.especies = await this.appService.httpGet(`getEspecies`);
	}
	async selectPlanos() {
		this.planos = await this.appService.httpGet(`getPlanos`);
	}
	async salvar() {
		try {
			this.load = true;
			await this.appService.httpPut(`pet/atualizar`, this.pet);
			this.appService.showToast('Dados alterados com sucesso', 3000);
			this.appService.events.upDetailLead.emit();
      		this.appService.navigateUrl(`${this.appService.ambiente}/proposta/${this.route.snapshot.params.id_lead}/pet/${this.route.snapshot.params.id_pet}`);
		} catch (e) {
			this.appService.errorHandler(e);
		} finally {
			this.load = false;
		}
	}

}
