import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoginPageRoutingModule } from './login-routing.module';
import { LoginPage } from './login.page';
import { AppService } from '../services/app.service';
import { SelecionarTipoCadastroComponent } from './../modal/selecionar-tipo-cadastro/selecionar-tipo-cadastro.component';
import { SelecionarTipoUsuarioComponent } from './../modal/selecionar-tipo-usuario/selecionar-tipo-usuario.component';
import { RecuperarSenhaComponent } from './../modal/recuperar-senha/recuperar-senha.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LoginPageRoutingModule
  ],
  providers: [AppService],
  declarations: [LoginPage, SelecionarTipoCadastroComponent, SelecionarTipoUsuarioComponent, RecuperarSenhaComponent],
  entryComponents: [SelecionarTipoCadastroComponent, SelecionarTipoUsuarioComponent, RecuperarSenhaComponent]
})
export class LoginPageModule { }
