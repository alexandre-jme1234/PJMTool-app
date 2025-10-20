import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProjectComponent } from './components/project/project.component';
import { TaskComponent } from './components/task/task.component';
import { DetailsTaskComponent } from './pages/details-task/details-task.component';
import { SigninUpComponent } from './pages/signin-up/signin-up.component';
import { authGuard } from './auth/auth.guard';


export const routes: Routes = [
    { path: 'login', component: SigninUpComponent },
    { path: '', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'projet/:id', component: ProjectComponent, canActivate: [authGuard] },
    { path: 'tache/:id', component: TaskComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
