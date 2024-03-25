import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DadosPagamentoPageRoutingModule } from './dados-pagamento-routing.module';

import { DadosPagamentoPage } from './dados-pagamento.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DadosPagamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [DadosPagamentoPage],
  entryComponents: []
})
export class DadosPagamentoPageModule {}
