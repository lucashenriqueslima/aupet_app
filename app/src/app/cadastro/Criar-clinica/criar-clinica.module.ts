import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CriarClinicaPageRoutingModule } from './criar-clinica-routing.module';
import { CriarClinicaPage } from './criar-clinica.page';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { GlobalComponentsModule } from './../../component-page/global-components.module';

//COMPONENTER
import { SelecionarEspecialidadeComponent } from 'src/app/modal/selecionar-especialidade/selecionar-especialidade.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarClinicaPageRoutingModule,
    CurrencyMaskModule,
    GlobalComponentsModule
  ],
  declarations: [CriarClinicaPage,SelecionarEspecialidadeComponent ],
  entryComponents: [ SelecionarEspecialidadeComponent]
})
export class CriarClinicaPageModule {}
