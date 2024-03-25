import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DirecionarPlanoComponent } from './direcionar-plano.component';

describe('DirecionarPlanoComponent', () => {
  let component: DirecionarPlanoComponent;
  let fixture: ComponentFixture<DirecionarPlanoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DirecionarPlanoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DirecionarPlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
