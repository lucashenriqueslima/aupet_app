import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FotoPageRoutingModule } from './foto-routing.module';
import { FotoPage } from './foto.page';
import { FotoReferenciaComponent } from './../../modal/foto-referencia/foto-referencia.component';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { InserirAnexoComponent } from 'src/app/modal/inserir-anexo/inserir-anexo.component';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FotoPageRoutingModule,
    GlobalComponentsModule,
    NgxIonicImageViewerModule
  ],
  declarations: [FotoPage, FotoReferenciaComponent, InserirAnexoComponent],
  entryComponents: []
})
export class FotoPageModule { }
