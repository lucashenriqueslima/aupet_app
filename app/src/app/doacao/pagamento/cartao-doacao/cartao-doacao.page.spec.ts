import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { CartaoDoacaoPage } from './cartao-doacao.page';

describe('CartaoDoacaoPage', () => {
  let component: CartaoDoacaoPage;
  let fixture: ComponentFixture<CartaoDoacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CartaoDoacaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(CartaoDoacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
