import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CartaoPagamentoPageRoutingModule } from './cartao-pagamento-routing.module';

import { CartaoPagamentoPage } from './cartao-pagamento.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CartaoPagamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [CartaoPagamentoPage],
  entryComponents: []
})
export class CartaoPagamentoPageModule {}
