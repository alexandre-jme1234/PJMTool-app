import { UserModel } from "../user/user.model";
import { TaskModel } from "../task/task.model";

export class ProjetModel {
    id: number | null = null;
    nom: string | null = null;
    description: string | null = null;
    date_echeance: Date | null = null;
    date_creation: Date | null = null;
    utilisateurs_projet: UserModel[] | null = [];
    projet_taches: TaskModel[] | null = [];
    taches: TaskModel[] | null = [];
    createur: UserModel | null = null;
}
