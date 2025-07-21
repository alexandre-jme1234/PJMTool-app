import { TaskModel } from '../task/task.model';

export interface Project {
    id?: number,
    nom: string,
    createur: string,
    date_echeance: string,
    email_user?: string,
    role_projet?: string,
    description?: string,
    taches?: TaskModel[]
};