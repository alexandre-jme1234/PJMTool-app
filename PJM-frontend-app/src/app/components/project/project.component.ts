import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Project } from '../../services/projects/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project.component.html',
  styleUrl: './project.component.css'
})
export class ProjectComponent implements OnInit {

  @Input() projet: Project | undefined;

  constructor(private route: ActivatedRoute,private projetService: ProjectService) {};
  
  
  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.projetService.getProjectById(id).subscribe((data) => {
      this.projet = data;
    });
  }






}
