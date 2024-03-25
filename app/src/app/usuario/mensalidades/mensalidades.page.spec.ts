import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MensalidadesPage } from './mensalidades.page';

describe('MensalidadesPage', () => {
  let component: MensalidadesPage;
  let fixture: ComponentFixture<MensalidadesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MensalidadesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MensalidadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
