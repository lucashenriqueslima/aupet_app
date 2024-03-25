import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VacinasPetPageRoutingModule } from './vacinas-pet-routing.module';

import { VacinasPetPage } from './vacinas-pet.page';

//MODAL
import { AdicionarVacinaComponent } from './../../../../modal/adicionar-vacina/adicionar-vacina.component';
import { DirecionarPlanoComponent } from './../../../../modal/direcionar-plano/direcionar-plano.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VacinasPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [VacinasPetPage, AdicionarVacinaComponent,DirecionarPlanoComponent],
  entryComponents: [AdicionarVacinaComponent,DirecionarPlanoComponent]
})
export class VacinasPetPageModule {}
