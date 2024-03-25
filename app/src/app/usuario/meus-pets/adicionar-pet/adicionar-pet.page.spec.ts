import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AdicionarPetPage } from './adicionar-pet.page';

describe('AdicionarPetPage', () => {
  let component: AdicionarPetPage;
  let fixture: ComponentFixture<AdicionarPetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdicionarPetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdicionarPetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
