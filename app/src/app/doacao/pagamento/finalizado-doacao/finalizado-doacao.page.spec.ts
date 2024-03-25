import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FinalizadoDoacaoPage } from './finalizado-doacao.page';

describe('FinalizadoDoacaoPage', () => {
  let component: FinalizadoDoacaoPage;
  let fixture: ComponentFixture<FinalizadoDoacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinalizadoDoacaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FinalizadoDoacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
