import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastroConcluidoPageRoutingModule } from './cadastro-concluido-routing.module';

import { CadastroConcluidoPage } from './cadastro-concluido.page';
import { GlobalComponentsModule } from './../../component-page/global-components.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastroConcluidoPageRoutingModule,
    GlobalComponentsModule,
  ],
  declarations: [CadastroConcluidoPage]
})
export class CadastroConcluidoPageModule {}
