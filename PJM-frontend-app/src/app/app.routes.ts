import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProjectComponent } from './components/project/project.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'projet/:id', component: ProjectComponent },
];
