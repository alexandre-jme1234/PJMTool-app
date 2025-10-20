import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SigninUpComponent } from './signin-up.component';

describe('SigninUpComponent', () => {
  let component: SigninUpComponent;
  let fixture: ComponentFixture<SigninUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SigninUpComponent, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SigninUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
