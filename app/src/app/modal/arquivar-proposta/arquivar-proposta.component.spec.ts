import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ArquivarPropostaComponent } from './arquivar-proposta.component';

describe('ArquivarPropostaComponent', () => {
  let component: ArquivarPropostaComponent;
  let fixture: ComponentFixture<ArquivarPropostaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArquivarPropostaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ArquivarPropostaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
