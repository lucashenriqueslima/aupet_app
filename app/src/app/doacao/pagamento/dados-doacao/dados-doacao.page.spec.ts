import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DadosDoacaoPage } from './dados-doacao.page';

describe('DadosDoacaoPage', () => {
  let component: DadosDoacaoPage;
  let fixture: ComponentFixture<DadosDoacaoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DadosDoacaoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DadosDoacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
