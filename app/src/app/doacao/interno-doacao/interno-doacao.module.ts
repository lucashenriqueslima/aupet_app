import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { InternoDoacaoPageRoutingModule } from './interno-doacao-routing.module';
import { InternoDoacaoPage } from './interno-doacao.page';
import { GlobalComponentsModule } from 'src/app/component-page/global-components.module';
import { NgxIonicImageViewerModule } from 'ngx-ionic-image-viewer';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InternoDoacaoPageRoutingModule,
    GlobalComponentsModule,
    NgxIonicImageViewerModule
  ],
  declarations: [InternoDoacaoPage],
  entryComponents: []
})
export class InternoDoacaoPageModule {}
