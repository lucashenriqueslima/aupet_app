import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VermifugosPetPageRoutingModule } from './vermifugos-pet-routing.module';

import { VermifugosPetPage } from './vermifugos-pet.page';

//MODAL
import { AdicionarVermifugoComponent } from './../../../../modal/adicionar-vermifugo/adicionar-vermifugo.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VermifugosPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [VermifugosPetPage, AdicionarVermifugoComponent],
  entryComponents: [AdicionarVermifugoComponent]
})
export class VermifugosPetPageModule {}
