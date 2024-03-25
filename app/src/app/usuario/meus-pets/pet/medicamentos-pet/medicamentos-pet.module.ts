import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MedicamentosPetPageRoutingModule } from './medicamentos-pet-routing.module';

import { MedicamentosPetPage } from './medicamentos-pet.page';

//MODAL
import { AdicionarMedicamentoComponent } from './../../../../modal/adicionar-medicamento/adicionar-medicamento.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MedicamentosPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [MedicamentosPetPage, AdicionarMedicamentoComponent],
  entryComponents: [AdicionarMedicamentoComponent]
})
export class MedicamentosPetPageModule {}
