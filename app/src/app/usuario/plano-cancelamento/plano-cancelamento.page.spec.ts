import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PlanoCancelamentoPage } from './plano-cancelamento.page';

describe('PlanoCancelamentoPage', () => {
  let component: PlanoCancelamentoPage;
  let fixture: ComponentFixture<PlanoCancelamentoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanoCancelamentoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PlanoCancelamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
