import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelecionarTipoCadastroComponent } from './selecionar-tipo-cadastro.component';

describe('SelecionarTipoCadastroComponent', () => {
  let component: SelecionarTipoCadastroComponent;
  let fixture: ComponentFixture<SelecionarTipoCadastroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecionarTipoCadastroComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarTipoCadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
