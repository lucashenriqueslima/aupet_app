import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SelecionarEspecialidadeComponent } from './selecionar-especialidade.component';

describe('SelecionarEspecialidadeComponent', () => {
  let component: SelecionarEspecialidadeComponent;
  let fixture: ComponentFixture<SelecionarEspecialidadeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelecionarEspecialidadeComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SelecionarEspecialidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
