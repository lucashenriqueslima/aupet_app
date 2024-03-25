import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AdicionarPetPageRoutingModule } from './adicionar-pet-routing.module';
import { AdicionarPetPage } from './adicionar-pet.page';
//COMPONENTES
import { GlobalComponentsModule } from '../../../component-page/global-components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdicionarPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [AdicionarPetPage],
 entryComponents: []
})
export class AdicionarPetPageModule {}
