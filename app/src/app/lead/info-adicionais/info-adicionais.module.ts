import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InfoAdicionaisPageRoutingModule } from './info-adicionais-routing.module';
import { InfoAdicionaisPage } from './info-adicionais.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';




@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InfoAdicionaisPageRoutingModule,
    GlobalComponentsModule,
  ],
  declarations: [InfoAdicionaisPage]
})
export class InfoAdicionaisPageModule {}
