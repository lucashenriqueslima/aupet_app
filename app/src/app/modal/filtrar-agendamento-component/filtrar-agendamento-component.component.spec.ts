import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FiltrarAgendamentoComponentComponent } from './filtrar-agendamento-component.component';

describe('FiltrarAgendamentoComponentComponent', () => {
  let component: FiltrarAgendamentoComponentComponent;
  let fixture: ComponentFixture<FiltrarAgendamentoComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiltrarAgendamentoComponentComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltrarAgendamentoComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
