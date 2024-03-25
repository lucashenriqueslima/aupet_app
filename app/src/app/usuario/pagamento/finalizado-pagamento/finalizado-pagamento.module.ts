import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FinalizadoPagamentoPageRoutingModule } from './finalizado-pagamento-routing.module';

import { FinalizadoPagamentoPage } from './finalizado-pagamento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FinalizadoPagamentoPageRoutingModule
  ],
  declarations: [FinalizadoPagamentoPage]
})
export class FinalizadoPagamentoPageModule {}
