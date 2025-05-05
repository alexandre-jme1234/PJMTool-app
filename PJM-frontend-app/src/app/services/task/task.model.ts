export interface Task {
    id: number;
    nom: string;
    destinataire_id: number | null;
    projet_id: number;
    commanditaire_id: number | null;
    date_debut: string;
    date_fin: string;
    priorite: string;
    description: string;
}