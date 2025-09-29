import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskOverlayComponent } from './task-overlay.component';

describe('TaskOverlayComponent', () => {
  let component: TaskOverlayComponent;
  let fixture: ComponentFixture<TaskOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
