import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InternoAgendamentoPageRoutingModule } from './interno-agendamento-routing.module';
import { InternoAgendamentoPage } from './interno-agendamento.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
//Modal
import { DadosClienteAgendamentoComponent } from './../../../modal/dados-cliente-agendamento/dados-cliente-agendamento.component';
import { CancelarAgendamentoComponent } from './../../../modal/cancelar-agendamento/cancelar-agendamento.component';
import { TratarAgendamentoComponent } from './../../../modal/tratar-agendamento/tratar-agendamento.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternoAgendamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [InternoAgendamentoPage , DadosClienteAgendamentoComponent , CancelarAgendamentoComponent,TratarAgendamentoComponent ],
  entryComponents: [DadosClienteAgendamentoComponent , CancelarAgendamentoComponent,TratarAgendamentoComponent]
})
export class InternoAgendamentoPageModule {}
