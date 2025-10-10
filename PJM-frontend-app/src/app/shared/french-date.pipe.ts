import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'frenchDate',
  standalone: true
})
export class FrenchDatePipe implements PipeTransform {
  private readonly jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  private readonly mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  transform(value: Date | string | null): string {
    if (!value) return 'Non définie';

    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return 'Date invalide';

    const jour = this.jours[date.getDay()];
    const numeroJour = date.getDate();
    const mois = this.mois[date.getMonth()];
    const annee = date.getFullYear();

    return `${jour} ${numeroJour} ${mois} ${annee}`;
  }
}
