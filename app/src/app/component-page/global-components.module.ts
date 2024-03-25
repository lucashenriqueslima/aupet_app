import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReversePipe, ArraySortPipe, SafeHtmlPipe, notfNotReadPipe, SafeLinkPipe, CallbackPipe } from './reverse.pipe';
import { LowerDirective, FormatNickDirective, UpperDirective } from './directives';
import { Ionic2MaskDirective } from './mask';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { HeaderSimplesComponent } from './../componentes/header-simples/header-simples.component';
import { AlterarDadosClienteComponent } from '../modal/alterar-dados-cliente/alterar-dados-cliente.component';
import { ButtonSearchComponent } from '../componentes/button-search/button-search.component';
import { MobileMenuComponent } from '../usuario/mobile-menu/mobile-menu.component';


@NgModule({
    imports: [CommonModule, FormsModule, CurrencyMaskModule],
    declarations: [
        Ionic2MaskDirective,
        ReversePipe,
        ArraySortPipe,
        LowerDirective,
        UpperDirective,
        FormatNickDirective,
        SafeHtmlPipe,
        notfNotReadPipe,
        SafeLinkPipe,
        AlterarDadosClienteComponent,
        ButtonSearchComponent,
        HeaderSimplesComponent,
        CallbackPipe,
        MobileMenuComponent
    ],
    exports: [
        Ionic2MaskDirective,
        ReversePipe,
        ArraySortPipe,
        LowerDirective,
        UpperDirective,
        FormatNickDirective,
        SafeHtmlPipe,
        notfNotReadPipe,
        SafeLinkPipe,
        AlterarDadosClienteComponent,
        ButtonSearchComponent,
        HeaderSimplesComponent,
        CallbackPipe,
        MobileMenuComponent
    ],
    entryComponents: [
        AlterarDadosClienteComponent
    ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class GlobalComponentsModule { }