import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DetailsTaskComponent } from './details-task.component';

describe('DetailsTaskComponent', () => {
  let component: DetailsTaskComponent;
  let fixture: ComponentFixture<DetailsTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsTaskComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ projet_id: '1', tache_id: '1' }),
            snapshot: { 
              params: { projet_id: '1', tache_id: '1' },
              paramMap: {
                get: (key: string) => {
                  const params: any = { projet_id: '1', tache_id: '1' };
                  return params[key];
                }
              }
            }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
