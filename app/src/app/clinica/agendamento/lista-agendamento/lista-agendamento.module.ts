import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaAgendamentoPageRoutingModule } from './lista-agendamento-routing.module';

import { ListaAgendamentoPage } from './lista-agendamento.page';


import { GlobalComponentsModule } from '../../../component-page/global-components.module';
import { FiltrarAgendamentoComponentComponent } from '../../../modal/filtrar-agendamento-component/filtrar-agendamento-component.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaAgendamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ListaAgendamentoPage, FiltrarAgendamentoComponentComponent],
  entryComponents: [ FiltrarAgendamentoComponentComponent]
})
export class ListaAgendamentoPageModule {}
