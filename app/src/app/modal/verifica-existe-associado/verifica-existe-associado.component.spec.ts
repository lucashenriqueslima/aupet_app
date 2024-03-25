import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { VerificaExisteAssociadoComponent } from './verifica-existe-associado.component';

describe('VerificaExisteAssociadoComponent', () => {
  let component: VerificaExisteAssociadoComponent;
  let fixture: ComponentFixture<VerificaExisteAssociadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerificaExisteAssociadoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(VerificaExisteAssociadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
