import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InternoDoacaoPage } from './interno-doacao.page';

const routes: Routes = [
  {
    path: '',
    component: InternoDoacaoPage
  },
  {
    path: 'pagamento/dados-doacao',
    loadChildren: () => import('src/app/doacao/pagamento/dados-doacao/dados-doacao.module').then( m => m.DadosDoacaoPageModule)
  },
  {
    path: 'pagamento/cartao-doacao',
    loadChildren: () => import('src/app/doacao/pagamento/cartao-doacao/cartao-doacao.module').then( m => m.CartaoDoacaoPageModule)
  },
  {
    path: 'pagamento/boleto-doacao',
    loadChildren: () => import('src/app/doacao/pagamento/boleto-doacao/boleto-doacao.module').then( m => m.BoletoDoacaoPageModule)
  },
  {
    path: 'pagamento/finalizado-doacao',
    loadChildren: () => import('src/app/doacao/pagamento/finalizado-doacao/finalizado-doacao.module').then( m => m.FinalizadoDoacaoPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InternoDoacaoPageRoutingModule {}
