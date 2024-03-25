import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { IonicModule } from '@ionic/angular';

import { MapaPageRoutingModule } from './mapa-routing.module';

import { MapaPage } from './mapa.page';

import { ClinicaMapaComponent } from 'src/app/modal/clinica-mapa/clinica-mapa.component';
import { FiltroMapaComponent } from './../../../modal/filtro-mapa/filtro-mapa.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MapaPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [MapaPage, ClinicaMapaComponent,FiltroMapaComponent],
  entryComponents: [ClinicaMapaComponent,FiltroMapaComponent]
})
export class MapaPageModule {}
