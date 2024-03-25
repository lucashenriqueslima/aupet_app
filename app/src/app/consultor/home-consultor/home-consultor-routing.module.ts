import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeConsultorPage } from './home-consultor.page';

const routes: Routes = [
  {
    path: '',
    component: HomeConsultorPage
  },
  {
    path: 'perfil',
    loadChildren: () => import('../../consultor/perfil-consultor/perfil-consultor.module').then(m => m.PerfilConsultorPageModule)
  },
  {
    path: "criar-proposta",
    loadChildren: () => import("src/app/criar-proposta/criar-proposta.module").then(m => m.CriarPropostaPageModule)
  },
  {
    path: "propostas",
    loadChildren: () => import("src/app/lead/lista-lead/lista-lead.module").then(m => m.ListaLeadPageModule)
  },
  {
    path: "proposta/:id_lead",
    loadChildren: () => import("src/app/lead/interno-lead/interno-lead.module").then(m => m.InternoLeadPageModule)
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
    path: 'extrato',
    loadChildren: () => import('src/app/extrato/extrato.module').then( m => m.ExtratoPageModule)
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeConsultorPageRoutingModule { }