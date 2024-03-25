import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditarDadosPetPage } from './editar-dados-pet.page';

describe('EditarDadosPetPage', () => {
  let component: EditarDadosPetPage;
  let fixture: ComponentFixture<EditarDadosPetPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditarDadosPetPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditarDadosPetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
