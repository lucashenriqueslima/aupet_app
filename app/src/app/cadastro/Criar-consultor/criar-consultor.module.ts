import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CriarConsultorPageRoutingModule } from './criar-consultor-routing.module';
import { CriarConsultorPage } from './criar-consultor.page';
import { GlobalComponentsModule } from './../../component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarConsultorPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [CriarConsultorPage],
  entryComponents: []
})
export class CriarConsultorPageModule {}
