import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectComponent } from './components/project/project.component';
import { TaskComponent } from './components/task/task.component';
import { DetailsTaskComponent } from './pages/details-task/details-task.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'projet/:id', component: ProjectComponent },
    { path: 'tache/:id', component: TaskComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];
