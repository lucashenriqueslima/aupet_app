import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeConsultorPage } from './home-consultor.page';

describe('HomeConsultorPage', () => {
  let component: HomeConsultorPage;
  let fixture: ComponentFixture<HomeConsultorPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeConsultorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeConsultorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
