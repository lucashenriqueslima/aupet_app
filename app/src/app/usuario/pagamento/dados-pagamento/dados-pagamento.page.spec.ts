import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DadosPagamentoPage } from './dados-pagamento.page';

describe('DadosPagamentoPage', () => {
  let component: DadosPagamentoPage;
  let fixture: ComponentFixture<DadosPagamentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosPagamentoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DadosPagamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
