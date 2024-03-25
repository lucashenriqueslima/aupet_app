import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { InternoAgendamentoPage } from './interno-agendamento.page';

describe('InternoAgendamentoPage', () => {
  let component: InternoAgendamentoPage;
  let fixture: ComponentFixture<InternoAgendamentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InternoAgendamentoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(InternoAgendamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
