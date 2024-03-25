import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TermoDeFiliacaoPage } from './termo-de-filiacao.page';

describe('TermoDeFiliacaoPage', () => {
  let component: TermoDeFiliacaoPage;
  let fixture: ComponentFixture<TermoDeFiliacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermoDeFiliacaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TermoDeFiliacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
