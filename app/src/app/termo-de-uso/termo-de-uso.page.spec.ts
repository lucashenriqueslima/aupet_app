import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TermoDeUsoPage } from './termo-de-uso.page';

describe('TermoDeUsoPage', () => {
  let component: TermoDeUsoPage;
  let fixture: ComponentFixture<TermoDeUsoPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TermoDeUsoPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TermoDeUsoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
