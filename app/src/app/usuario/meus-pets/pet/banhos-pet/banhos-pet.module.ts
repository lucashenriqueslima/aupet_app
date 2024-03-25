import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BanhosPetPageRoutingModule } from './banhos-pet-routing.module';

import { BanhosPetPage } from './banhos-pet.page';

//MODAL
import { AdicionarBanhoComponent } from './../../../../modal/adicionar-banho/adicionar-banho.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BanhosPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [BanhosPetPage, AdicionarBanhoComponent],
  entryComponents: [AdicionarBanhoComponent]
})
export class BanhosPetPageModule {}
