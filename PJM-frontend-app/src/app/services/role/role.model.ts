export class RoleModel {
    id: number | null = null;
    nom: string | null = null;
    ajouter_membre: boolean = false;
    creer_tache: boolean = false;
    assigne_tache: boolean = false;
    maj_tache: boolean = false;
    vue_tache: boolean = false;
    vue_tableau_de_bord: boolean = false;
    etre_notifie: boolean = false;
    vue_historique_modifications: boolean = false;
}
