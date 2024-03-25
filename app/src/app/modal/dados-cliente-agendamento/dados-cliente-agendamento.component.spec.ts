import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DadosClienteAgendamentoComponent } from './dados-cliente-agendamento.component';

describe('DadosClienteAgendamentoComponent', () => {
  let component: DadosClienteAgendamentoComponent;
  let fixture: ComponentFixture<DadosClienteAgendamentoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosClienteAgendamentoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DadosClienteAgendamentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
