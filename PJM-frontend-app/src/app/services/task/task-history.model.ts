export interface TaskHistoryEvent {
  id?: number;
  taskId: number;
  taskName: string;
  eventType: 'CREATION' | 'ETAT_CHANGE' | 'PRIORITE_CHANGE';
  oldValue?: string;
  newValue: string;
  timestamp: Date;
  priorite?: string; // Pour trier par priorité de la tâche
}

export class TaskHistory {
  private static events: TaskHistoryEvent[] = [];

  static addEvent(event: Omit<TaskHistoryEvent, 'timestamp'>): void {
    const newEvent: TaskHistoryEvent = {
      ...event,
      timestamp: new Date()
    };
    this.events.push(newEvent);
    console.log('📝 Événement historique ajouté:', newEvent);
  }

  static getEventsByProject(projectId: number, tasks: any[]): TaskHistoryEvent[] {
    // Filtrer les événements pour les tâches du projet
    const taskIds = tasks.map(t => t.id);
    return this.events
      .filter(event => taskIds.includes(event.taskId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Plus récent en premier
  }

  static getEventsByPriority(projectId: number, tasks: any[]): TaskHistoryEvent[] {
    const events = this.getEventsByProject(projectId, tasks);
    
    // Trier par priorité puis par date
    const priorityOrder: { [key: string]: number } = {
      'HAUTE': 1,
      'MOYENNE': 2,
      'FAIBLE': 3
    };

    return events.sort((a, b) => {
      const priorityA = priorityOrder[a.priorite || 'FAIBLE'] || 999;
      const priorityB = priorityOrder[b.priorite || 'FAIBLE'] || 999;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // Priorité d'abord
      }
      
      return b.timestamp.getTime() - a.timestamp.getTime(); // Puis date
    });
  }

  static clearHistory(): void {
    this.events = [];
  }
}
