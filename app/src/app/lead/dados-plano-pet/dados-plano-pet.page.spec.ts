import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DadosPlanoPetPage } from './dados-plano-pet.page';

describe('DadosPlanoPetPage', () => {
  let component: DadosPlanoPetPage;
  let fixture: ComponentFixture<DadosPlanoPetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosPlanoPetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DadosPlanoPetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
