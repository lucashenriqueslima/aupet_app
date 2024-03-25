import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilConsultorPageRoutingModule } from './perfil-consultor-routing.module';
import { PerfilConsultorPage } from './perfil-consultor.page';
import { GlobalComponentsModule } from '../../component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilConsultorPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [PerfilConsultorPage],
  entryComponents: []
})
export class PerfilConsultorPageModule {}
