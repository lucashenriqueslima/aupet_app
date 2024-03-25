import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeClinicaPage } from './home-clinica.page';

describe('HomeClinicaPage', () => {
  let component: HomeClinicaPage;
  let fixture: ComponentFixture<HomeClinicaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeClinicaPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeClinicaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
