import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AlteraDadosPetComponent } from './altera-dados-pet.component';

describe('AlteraDadosPetComponent', () => {
  let component: AlteraDadosPetComponent;
  let fixture: ComponentFixture<AlteraDadosPetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlteraDadosPetComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AlteraDadosPetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
