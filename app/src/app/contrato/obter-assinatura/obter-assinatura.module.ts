import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ObterAssinaturaPageRoutingModule } from './obter-assinatura-routing.module.';
import { ObterAssinaturaPage } from './obter-assinatura.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ObterAssinaturaPageRoutingModule,
    GlobalComponentsModule,
  ],
  declarations: [ObterAssinaturaPage],
  entryComponents: []
})
export class ObterAssinaturaPageModule {}