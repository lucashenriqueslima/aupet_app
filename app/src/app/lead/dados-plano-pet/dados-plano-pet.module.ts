import { GlobalComponentsModule } from './../../component-page/global-components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DadosPlanoPetPageRoutingModule } from './dados-plano-pet-routing.module';
import { DadosPlanoPetPage } from './dados-plano-pet.page';

//COMPONENTES
import { AlteraDadosPetComponent } from './../../modal/altera-dados-pet/altera-dados-pet.component';
import { ArquivarPropostaComponent } from './../../modal/arquivar-proposta/arquivar-proposta.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DadosPlanoPetPageRoutingModule,
    GlobalComponentsModule
  ],
  declarations: [DadosPlanoPetPage, AlteraDadosPetComponent,ArquivarPropostaComponent],
  entryComponents: [AlteraDadosPetComponent,ArquivarPropostaComponent]
})
export class DadosPlanoPetPageModule {}
