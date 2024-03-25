import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AlertasPage implements OnInit {

  pets: any = {};
  vacinas;
  exames;
  medicamentos;
  vermifungos;
  banhos;
  consultas;
  cirurgias;
  internacoes;
  constructor(
    public appService: AppService,
    public route: ActivatedRoute,
  ) { }
  terminou = false;
  async ngOnInit() {
    await this.getPets();
    this.terminou = true;
  }

  async getPets() {
    this.pets = await this.appService.httpGet('associado/getPets');
    this.vacinas = this.pets.filter((pet) => { return Object.keys(pet.vacinas).length !== 0 }).length;
    this.exames = this.pets.filter((pet) => { return Object.keys(pet.exames).length !== 0 }).length;
    this.medicamentos = this.pets.filter((pet) => { return Object.keys(pet.medicamentos).length !== 0 }).length;
    this.vermifungos = this.pets.filter((pet) => { return Object.keys(pet.vermifungos).length !== 0 }).length;
    this.banhos = this.pets.filter((pet) => { return Object.keys(pet.banhos).length !== 0 }).length;
    this.consultas = this.pets.filter((pet) => { return Object.keys(pet.consultas).length !== 0 }).length;
    this.cirurgias = this.pets.filter((pet) => { return Object.keys(pet.cirurgias).length !== 0 }).length;
    this.internacoes = this.pets.filter((pet) => { return Object.keys(pet.internacoes).length !== 0 }).length;
  }


}
