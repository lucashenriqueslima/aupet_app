import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { InfoPetPageRoutingModule } from './info-pet-routing.module';

import { InfoPetPage } from './info-pet.page';

import { GlobalComponentsModule } from '../../../../component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [InfoPetPage],
  entryComponents: []
})
export class InfoPetPageModule {}