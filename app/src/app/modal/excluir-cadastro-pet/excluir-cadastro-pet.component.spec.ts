import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ExcluirCadastroPetComponent } from './excluir-cadastro-pet.component';

describe('ExcluirCadastroPetComponent', () => {
  let component: ExcluirCadastroPetComponent;
  let fixture: ComponentFixture<ExcluirCadastroPetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExcluirCadastroPetComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ExcluirCadastroPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
