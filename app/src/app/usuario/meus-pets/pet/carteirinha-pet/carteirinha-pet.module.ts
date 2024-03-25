import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CarteirinhaPetPageRoutingModule } from './carteirinha-pet-routing.module';

import { CarteirinhaPetPage } from './carteirinha-pet.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CarteirinhaPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [CarteirinhaPetPage],
  entryComponents: []
})
export class CarteirinhaPetPageModule {}
