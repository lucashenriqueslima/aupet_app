import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePage } from './home.page';
const routes: Routes = [
  {
    path: '',
    component: HomePage
  },
  {
    path: 'doacao',
    loadChildren: () => import('src/app/doacao/lista-doacao/lista-doacao.module').then( m => m.ListaDoacaoPageModule)
  },
  {
    path: 'doar/:id',
    loadChildren: () => import('src/app/doacao/interno-doacao/interno-doacao.module').then( m => m.InternoDoacaoPageModule)
  },
  {
    path: 'alertas',
    loadChildren: () => import('../../usuario/alertas/alertas.module').then( m => m.AlertasPageModule)
  },
  {
    path: 'perfil',
    loadChildren: () => import('../../usuario/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
  {
    path: 'planos',
    loadChildren: () => import('../../usuario/planos/planos.module').then( m => m.PlanosPageModule)
  },
  {
    path: 'planos/:id_pet',
    loadChildren: () => import('../../usuario/planos/planos.module').then( m => m.PlanosPageModule)
  },
  {
    path: 'planos/:id_pet/:id_plano',
    loadChildren: () => import('../../usuario/planos/planos.module').then( m => m.PlanosPageModule)
  },
  {
    path: 'plano/:id_plano',
    loadChildren: () => import('../../usuario/pagamento/resumo-pagamento/resumo-pagamento.module').then( m => m.ResumoPagamentoPageModule)
  },
  {
    path: 'plano/:id_plano/:id_pet',
    loadChildren: () => import('../../usuario/pagamento/resumo-pagamento/resumo-pagamento.module').then( m => m.ResumoPagamentoPageModule)
  },
  {
    path: 'mensalidades/:id_assinatura/:id_pet',
    loadChildren: () => import('../../usuario/mensalidades/mensalidades.module').then( m => m.MensalidadesPageModule)
  },
  {
    path: 'dados',
    loadChildren: () => import('../../usuario/dados/dados.module').then( m => m.DadosPageModule)
  },
  {
    path: 'dados-pagamento',
    loadChildren: () => import('../../usuario/pagamento/dados-pagamento/dados-pagamento.module').then( m => m.DadosPagamentoPageModule)
  },
  {
    path: 'dados-pagamento/:id_pet/:id_plano',
    loadChildren: () => import('../../usuario/pagamento/dados-pagamento/dados-pagamento.module').then( m => m.DadosPagamentoPageModule)
  },
  {
    path: 'cartao-pagamento',
    loadChildren: () => import('../../usuario/pagamento/cartao-pagamento/cartao-pagamento.module').then( m => m.CartaoPagamentoPageModule)
  },
  {
    path: 'cartao-pagamento/:id_pet/:id_plano',
    loadChildren: () => import('../../usuario/pagamento/cartao-pagamento/cartao-pagamento.module').then( m => m.CartaoPagamentoPageModule)
  },
  {
    path: 'finalizado-pagamento',
    loadChildren: () => import('../../usuario/pagamento/finalizado-pagamento/finalizado-pagamento.module').then( m => m.FinalizadoPagamentoPageModule)
  },
  {
    path: 'finalizado-pagamento/:id_pet/:action',
    loadChildren: () => import('../../usuario/pagamento/finalizado-pagamento/finalizado-pagamento.module').then( m => m.FinalizadoPagamentoPageModule)
  },
  {
    path: 'meus-pets',
    loadChildren: () => import('../../usuario/meus-pets/lista-pet/lista-pet.module').then( m => m.ListaPetPageModule)
  },
  {
    path: 'clinicas',
    loadChildren: () => import('../../usuario/clinicas/mapa/mapa.module').then( m => m.MapaPageModule)
  },
  {
    path: 'clinica/:id',
    loadChildren: () => import('../../usuario/clinicas/unidade/unidade.module').then( m => m.UnidadePageModule)
  },
  {
    path: "proposta/:id_lead",
    loadChildren: () => import("src/app/lead/interno-lead/interno-lead.module").then(m => m.InternoLeadPageModule)
  },
  {
    path: "cancelar-plano/:id_pet/:id_plano",
    loadChildren: () => import("../../usuario/plano-cancelamento/plano-cancelamento.module").then(m => m.PlanoCancelamentoPageModule)
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
