export class UserModel {
    id: number | null = null;
    nom: string | null = null;
    role_app: string | null = null;
    email: string | null = null;
    password: string | null = null;
    etat_connexion: boolean = false;
    tache_commanditaire: any[] | null = null;
    taches_destinataire: any[] | null = null;
    projets_utilisateur: any[] | null = null;
    projets: any[] | null = null;
    roles_projet: any[] | null = null;
}
