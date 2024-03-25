import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlertasPage } from './alertas.page';

describe('AlertasPage', () => {
  let component: AlertasPage;
  let fixture: ComponentFixture<AlertasPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertasPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
