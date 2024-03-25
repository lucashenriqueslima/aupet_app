import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ResumoPagamentoPage } from './resumo-pagamento.page';

describe('ResumoPagamentoPage', () => {
  let component: ResumoPagamentoPage;
  let fixture: ComponentFixture<ResumoPagamentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumoPagamentoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumoPagamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
