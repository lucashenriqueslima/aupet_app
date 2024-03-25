import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ListaAgendamentoPage } from './lista-agendamento.page';

describe('ListaAgendamentoPage', () => {
  let component: ListaAgendamentoPage;
  let fixture: ComponentFixture<ListaAgendamentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaAgendamentoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAgendamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
