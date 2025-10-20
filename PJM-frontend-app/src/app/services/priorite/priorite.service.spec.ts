import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PrioriteService } from './priorite.service';

describe('PrioriteService', () => {
  let service: PrioriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(PrioriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
