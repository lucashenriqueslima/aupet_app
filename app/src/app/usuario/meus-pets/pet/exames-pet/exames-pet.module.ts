import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExamesPetPageRoutingModule } from './exames-pet-routing.module';

import { ExamesPetPage } from './exames-pet.page';

//MODAL
import { AdicionarExameComponent } from './../../../../modal/adicionar-exame/adicionar-exame.component';
import { GlobalComponentsModule } from '../../../../component-page/global-components.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExamesPetPageRoutingModule , 
    GlobalComponentsModule
  ],
  declarations: [ExamesPetPage, AdicionarExameComponent],
  entryComponents: [AdicionarExameComponent]
})
export class ExamesPetPageModule {}
