import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';


import { RoleService } from './role.service';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('list roles', () => {
    const mockResponse = {
      success: true,
      data: [
        { id: 1, nom: 'ADMIN' },
        { id: 2, nom: 'MEMBER' },
        { id: 3, nom: 'OBSERVATEUR' }
      ]
    };

    const roles = service.getRoles();
    expect(roles.length).toBe(mockResponse.data.length);

    const req = httpMock.expectOne('http://localhost:8080/api/role/all');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  })
});
