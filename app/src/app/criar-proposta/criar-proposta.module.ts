import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CriarPropostaPageRoutingModule } from './criar-proposta-routing.module';
import { CriarPropostaPage } from './criar-proposta.page';
import { GlobalComponentsModule } from './../component-page/global-components.module';
//COMPONENTES

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarPropostaPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [CriarPropostaPage],
  entryComponents: []
})
export class CriarPropostaPageModule {}
