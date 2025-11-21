import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProjectService } from '../../services/projects/project.service';
import { TaskService } from '../../services/task/task.service';

import { DetailsTaskComponent } from './details-task.component';

describe('DetailsTaskComponent', () => {
  let component: DetailsTaskComponent;
  let fixture: ComponentFixture<DetailsTaskComponent>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const projectServiceSpy = jasmine.createSpyObj('ProjectService', ['getProjectById']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DetailsTaskComponent, HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useValue: projectServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { 
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

    projectService = TestBed.inject(ProjectService) as jasmine.SpyObj<ProjectService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsTaskComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should load task successfully when project and task exist', () => {
      const mockProject = {
        id: 1,
        nom: 'Test Project',
        taches: [
          { id: 1, nom: 'Task 1', description: 'Description 1' },
          { id: 2, nom: 'Task 2', description: 'Description 2' }
        ]
      };

      projectService.getProjectById.and.returnValue(of(mockProject));

      fixture.detectChanges(); // Déclenche ngOnInit

      expect(component.task).toEqual(jasmine.objectContaining({
        id: 1,
        nom: 'Task 1',
        description: 'Description 1'
      }));
      expect(component.projetNom).toBe('Test Project');
      expect(component.loading).toBe(false);
      expect(component.error).toBe('');
    });

    it('should set error when task is not found in project', () => {
      const mockProject = {
        id: 1,
        nom: 'Test Project',
        taches: [
          { id: 2, nom: 'Task 2', description: 'Description 2' }
        ]
      };

      projectService.getProjectById.and.returnValue(of(mockProject));

      fixture.detectChanges();

      expect(component.task).toBeUndefined();
      expect(component.loading).toBe(false);
      expect(component.error).toBe('Tâche introuvable.');
    });

    it('should set error when project has no taches', () => {
      const mockProject = {
        id: 1,
        nom: 'Test Project',
        taches: null
      };

      projectService.getProjectById.and.returnValue(of(mockProject));

      fixture.detectChanges();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Projet ou tâche introuvable.');
    });

    it('should set error when project is null', () => {
      projectService.getProjectById.and.returnValue(of(null));

      fixture.detectChanges();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Projet ou tâche introuvable.');
    });

    it('should set error when project is undefined', () => {
      projectService.getProjectById.and.returnValue(of(undefined));

      fixture.detectChanges();

      expect(component.loading).toBe(false);
      expect(component.error).toBe('Projet ou tâche introuvable.');
    });
  });

  describe('goBack()', () => {
    it('should navigate to home page', () => {
      projectService.getProjectById.and.returnValue(of({ id: 1, nom: 'Test', taches: [] }));
      fixture.detectChanges();

      component.goBack();

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });
});
