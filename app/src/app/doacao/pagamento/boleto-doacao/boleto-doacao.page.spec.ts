import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BoletoDoacaoPage } from './boleto-doacao.page';

describe('BoletoDoacaoPage', () => {
  let component: BoletoDoacaoPage;
  let fixture: ComponentFixture<BoletoDoacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BoletoDoacaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BoletoDoacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
