import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


import { MenuLateralPage } from './menu-lateral.page';

const routes: Routes = [
  {
    path: '',
    component: MenuLateralPage,
    children: [
      {
        path: '',
        loadChildren: () => import('../home-clinica/home-clinica.module').then(m => m.HomeClinicaPageModule)
      },
      {
        path: 'perfil',
        loadChildren: () => import('../../clinica/perfil-clinica/perfil-clinica.module').then(m => m.PerfilClinicaPageModule)
      },
      {
        path: 'agendamentos',
        loadChildren: () => import('../../clinica/agendamento/lista-agendamento/lista-agendamento.module').then(m => m.ListaAgendamentoPageModule)
      },
      {
        path: 'doacao',
        loadChildren: () => import('src/app/doacao/lista-doacao/lista-doacao.module').then(m => m.ListaDoacaoPageModule)
      },
      {
        path: 'doar/:id',
        loadChildren: () => import('src/app/doacao/interno-doacao/interno-doacao.module').then( m => m.InternoDoacaoPageModule)
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
      }
    ]
  },
  {
    path: 'agendamento/:id_agendamento/especialidade/:id_especialidade',
    loadChildren: () => import('../../clinica/agendamento/interno-agendamento/interno-agendamento.module').then(m => m.InternoAgendamentoPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MenuLateralPageRoutingModule { }
