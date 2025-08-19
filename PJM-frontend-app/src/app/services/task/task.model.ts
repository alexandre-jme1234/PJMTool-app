import { UserModel } from "../user/user.model";
import { PrioriteModel } from "../priorite/priorite.model";
import { ProjetModel } from "../projects/projet.model";

export class TaskModel {
    id: number | null = null;
    commanditaire: UserModel | null = null;
    destinataire: UserModel | null = null;
    nom: string | null = null;
    description: string | null = null;
    est_termine: boolean = false;
    date_debut: Date | null = null;
    date_fin: Date | null = null;
    projet: ProjetModel | null = null;
    priorite: PrioriteModel | null = null;
    etat: string = '';
}
