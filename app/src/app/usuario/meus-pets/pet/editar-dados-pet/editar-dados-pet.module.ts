import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditarDadosPetPageRoutingModule } from './editar-dados-pet-routing.module';

import { EditarDadosPetPage } from './editar-dados-pet.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditarDadosPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [EditarDadosPetPage]
})
export class EditarDadosPetPageModule {}
