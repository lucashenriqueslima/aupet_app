import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssinarPlanoComponent } from './assinar-plano.component';

describe('AssinarPlanoComponent', () => {
  let component: AssinarPlanoComponent;
  let fixture: ComponentFixture<AssinarPlanoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssinarPlanoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssinarPlanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
