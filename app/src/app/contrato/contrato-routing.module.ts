import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContratoPage } from './contrato.page';

const routes: Routes = [
	{
		path: '',
		component: ContratoPage
	},
	{
		path: 'assinatura',
		loadChildren: () => import('./obter-assinatura/obter-assinatura.module').then(m => m.ObterAssinaturaPageModule)
	},
	{
		path: 'info-adicionais',
		loadChildren: () => import('./info-doc/info-doc.module').then(m => m.InfoDocPageModule)
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class ContratoPageRoutingModule { }