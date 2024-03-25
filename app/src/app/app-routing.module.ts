import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ConsultantGuard, AssociadoGuard, CredenciadaGuard } from './guards';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'cadastro/consultor',
    loadChildren: () => import('./cadastro/Criar-consultor/criar-consultor.module').then(m => m.CriarConsultorPageModule)
  },
  {
    path: 'cadastro/usuario',
    loadChildren: () => import('./cadastro/Criar-usuario/criar-usuario.module').then(m => m.CriarUsuarioPageModule)
  },
  {
    path: 'cadastro/usuario/:id_plano',
    loadChildren: () => import('./cadastro/Criar-usuario/criar-usuario.module').then(m => m.CriarUsuarioPageModule)
  },
  {
    path: 'cadastro/clinica',
    loadChildren: () => import('./cadastro/Criar-clinica/criar-clinica.module').then(m => m.CriarClinicaPageModule)
  },
  {
    path: 'consultor',
    loadChildren: () => import('./consultor/home-consultor/home-consultor.module').then(m => m.HomeConsultorPageModule),
    canActivate: [ConsultantGuard]
  },
  {
    path: 'clinica',
    loadChildren: () => import('./clinica/menu-lateral/menu-lateral.module').then(m => m.MenuLateralPageModule),
    canActivate: [CredenciadaGuard]
  },
  {
    path: 'associado',
    loadChildren: () => import('./usuario/home/home.module').then(m => m.HomePageModule),
    canActivate: [AssociadoGuard]
  },
  {
    path: 'cadastro-concluido/:cadastro',
    loadChildren: () => import('./cadastro/cadastro-concluido/cadastro-concluido.module').then( m => m.CadastroConcluidoPageModule)
  },
  {
    path: 'termo-de-uso',
    loadChildren: () => import('./termo-de-uso/termo-de-uso.module').then( m => m.TermoDeUsoPageModule)
  },
  {
    path: 'termo-de-filiacao',
    loadChildren: () => import('./termo-de-filiacao/termo-de-filiacao.module').then( m => m.TermoDeFiliacaoPageModule)
  },
  {
    path: 'termo-de-filiacao-plano/:id_plano',
    loadChildren: () => import('./termo-de-filiacao/termo-de-filiacao.module').then( m => m.TermoDeFiliacaoPageModule)
  },
  {
    path: 'boleto-doacao',
    loadChildren: () => import('./doacao/pagamento/boleto-doacao/boleto-doacao.module').then( m => m.BoletoDoacaoPageModule)
  },

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
