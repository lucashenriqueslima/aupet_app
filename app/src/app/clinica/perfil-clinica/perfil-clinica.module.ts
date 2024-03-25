import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PerfilClinicaPageRoutingModule } from './perfil-clinica-routing.module';
import { PerfilClinicaPage } from './perfil-clinica.page';
import { GlobalComponentsModule } from '../../component-page/global-components.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PerfilClinicaPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [PerfilClinicaPage ],
  entryComponents: []
})
export class PerfilClinicaPageModule {}
