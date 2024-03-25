import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaPetPageRoutingModule } from './lista-pet-routing.module';

import { ListaPetPage } from './lista-pet.page';

//COMPONENTES
import { GlobalComponentsModule } from '../../../component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [ListaPetPage,],
  entryComponents: []
})
export class ListaPetPageModule {}
