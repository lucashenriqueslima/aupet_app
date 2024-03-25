import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResumoPagamentoPageRoutingModule } from './resumo-pagamento-routing.module';

import { ResumoPagamentoPage } from './resumo-pagamento.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { SelecionarPetComponent } from 'src/app/modal/selecionar-pet/selecionar-pet.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResumoPagamentoPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ResumoPagamentoPage , SelecionarPetComponent],
  entryComponents: [SelecionarPetComponent]
})
export class ResumoPagamentoPageModule {}
