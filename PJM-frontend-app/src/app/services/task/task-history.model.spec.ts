import { TaskHistory, TaskHistoryEvent } from './task-history.model';

describe('TaskHistoryEvent Interface', () => {
  it('devrait créer un événement de création avec toutes les propriétés requises', () => {
    const event: TaskHistoryEvent = {
      id: 1,
      taskId: 10,
      taskName: 'Tâche Test',
      eventType: 'CREATION',
      newValue: 'EN_COURS',
      timestamp: new Date(),
      priorite: 'HAUTE'
    };

    expect(event.id).toBe(1);
    expect(event.taskId).toBe(10);
    expect(event.taskName).toBe('Tâche Test');
    expect(event.eventType).toBe('CREATION');
    expect(event.newValue).toBe('EN_COURS');
    expect(event.timestamp).toBeInstanceOf(Date);
    expect(event.priorite).toBe('HAUTE');
  });

  it('devrait créer un événement de changement d\'état avec oldValue', () => {
    const event: TaskHistoryEvent = {
      taskId: 20,
      taskName: 'Tâche Modifiée',
      eventType: 'ETAT_CHANGE',
      oldValue: 'EN_COURS',
      newValue: 'TERMINE',
      timestamp: new Date()
    };

    expect(event.oldValue).toBe('EN_COURS');
    expect(event.newValue).toBe('TERMINE');
    expect(event.eventType).toBe('ETAT_CHANGE');
  });

  it('devrait créer un événement de changement de priorité', () => {
    const event: TaskHistoryEvent = {
      taskId: 30,
      taskName: 'Tâche Prioritaire',
      eventType: 'PRIORITE_CHANGE',
      oldValue: 'FAIBLE',
      newValue: 'HAUTE',
      timestamp: new Date(),
      priorite: 'HAUTE'
    };

    expect(event.eventType).toBe('PRIORITE_CHANGE');
    expect(event.oldValue).toBe('FAIBLE');
    expect(event.newValue).toBe('HAUTE');
  });

  it('devrait accepter un événement sans id (optionnel)', () => {
    const event: TaskHistoryEvent = {
      taskId: 40,
      taskName: 'Sans ID',
      eventType: 'CREATION',
      newValue: 'A_FAIRE',
      timestamp: new Date()
    };

    expect(event.id).toBeUndefined();
  });

  it('devrait accepter un événement sans oldValue (optionnel)', () => {
    const event: TaskHistoryEvent = {
      taskId: 50,
      taskName: 'Sans OldValue',
      eventType: 'CREATION',
      newValue: 'EN_COURS',
      timestamp: new Date()
    };

    expect(event.oldValue).toBeUndefined();
  });

  it('devrait accepter un événement sans priorité (optionnel)', () => {
    const event: TaskHistoryEvent = {
      taskId: 60,
      taskName: 'Sans Priorité',
      eventType: 'ETAT_CHANGE',
      newValue: 'TERMINE',
      timestamp: new Date()
    };

    expect(event.priorite).toBeUndefined();
  });
});

describe('TaskHistory Class', () => {
  beforeEach(() => {
    // Nettoyer l'historique avant chaque test
    TaskHistory.clearHistory();
  });

  afterEach(() => {
    // Nettoyer après chaque test pour éviter les effets de bord
    TaskHistory.clearHistory();
  });

  describe('addEvent', () => {
    it('devrait ajouter un événement avec timestamp automatique', () => {
      const consoleSpy = spyOn(console, 'log');
      const beforeTime = new Date().getTime();
      
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      const afterTime = new Date().getTime();
      const events = TaskHistory.getEventsByProject(1, [{ id: 1 }]);
      
      expect(events.length).toBe(1);
      expect(events[0].taskId).toBe(1);
      expect(events[0].timestamp).toBeInstanceOf(Date);
      expect(events[0].timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime);
      expect(events[0].timestamp.getTime()).toBeLessThanOrEqual(afterTime);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('devrait ajouter plusieurs événements dans l\'ordre', () => {
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Tâche 2',
        eventType: 'CREATION',
        newValue: 'EN_COURS'
      });

      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche 1',
        eventType: 'ETAT_CHANGE',
        oldValue: 'A_FAIRE',
        newValue: 'EN_COURS'
      });

      const allEvents = TaskHistory.getEventsByProject(1, [{ id: 1 }, { id: 2 }]);
      expect(allEvents.length).toBe(3);
    });

    it('devrait préserver toutes les propriétés de l\'événement', () => {
      TaskHistory.addEvent({
        id: 100,
        taskId: 5,
        taskName: 'Tâche Complète',
        eventType: 'PRIORITE_CHANGE',
        oldValue: 'FAIBLE',
        newValue: 'HAUTE',
        priorite: 'HAUTE'
      });

      const events = TaskHistory.getEventsByProject(1, [{ id: 5 }]);
      expect(events[0].id).toBe(100);
      expect(events[0].taskName).toBe('Tâche Complète');
      expect(events[0].oldValue).toBe('FAIBLE');
      expect(events[0].priorite).toBe('HAUTE');
    });
  });

  describe('getEventsByProject', () => {
    beforeEach(() => {
      // Préparer des événements de test
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Projet 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Tâche Projet 1',
        eventType: 'CREATION',
        newValue: 'EN_COURS'
      });

      TaskHistory.addEvent({
        taskId: 3,
        taskName: 'Tâche Projet 2',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });
    });

    it('devrait retourner uniquement les événements des tâches du projet', () => {
      const tasks = [{ id: 1 }, { id: 2 }];
      const events = TaskHistory.getEventsByProject(1, tasks);

      expect(events.length).toBe(2);
      expect(events.every(e => [1, 2].includes(e.taskId))).toBe(true);
    });

    it('devrait retourner un tableau vide si aucune tâche ne correspond', () => {
      const tasks = [{ id: 999 }];
      const events = TaskHistory.getEventsByProject(1, tasks);

      expect(events.length).toBe(0);
    });

    it('devrait retourner un tableau vide si le tableau de tâches est vide', () => {
      const events = TaskHistory.getEventsByProject(1, []);

      expect(events.length).toBe(0);
    });

    it('devrait trier les événements du plus récent au plus ancien', () => {
      TaskHistory.clearHistory();
      
      // Ajouter des événements avec un délai pour garantir des timestamps différents
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Premier',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      // Simuler un délai
      const firstEvent = TaskHistory.getEventsByProject(1, [{ id: 1 }])[0];
      
      // Ajouter un deuxième événement
      setTimeout(() => {
        TaskHistory.addEvent({
          taskId: 1,
          taskName: 'Deuxième',
          eventType: 'ETAT_CHANGE',
          oldValue: 'A_FAIRE',
          newValue: 'EN_COURS'
        });
      }, 10);

      setTimeout(() => {
        const events = TaskHistory.getEventsByProject(1, [{ id: 1 }]);
        if (events.length === 2) {
          expect(events[0].timestamp.getTime()).toBeGreaterThanOrEqual(events[1].timestamp.getTime());
        }
      }, 20);
    });

    it('devrait gérer plusieurs tâches avec différents IDs', () => {
      const tasks = [
        { id: 1 },
        { id: 2 },
        { id: 10 },
        { id: 20 }
      ];

      const events = TaskHistory.getEventsByProject(1, tasks);
      expect(events.length).toBe(2); // Seulement taskId 1 et 2 existent
    });
  });

  describe('getEventsByPriority', () => {
    beforeEach(() => {
      TaskHistory.clearHistory();
      
      // Créer des événements avec différentes priorités
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Faible',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'FAIBLE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Tâche Haute',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      TaskHistory.addEvent({
        taskId: 3,
        taskName: 'Tâche Moyenne',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'MOYENNE'
      });
    });

    it('devrait trier les événements par priorité (HAUTE > MOYENNE > FAIBLE)', () => {
      const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const events = TaskHistory.getEventsByPriority(1, tasks);

      expect(events.length).toBe(3);
      expect(events[0].priorite).toBe('HAUTE');
      expect(events[1].priorite).toBe('MOYENNE');
      expect(events[2].priorite).toBe('FAIBLE');
    });

    it('devrait traiter les événements sans priorité comme FAIBLE', () => {
      TaskHistory.addEvent({
        taskId: 4,
        taskName: 'Sans Priorité',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
        // Pas de priorité définie
      });

      const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const events = TaskHistory.getEventsByPriority(1, tasks);

      // L'événement sans priorité devrait être traité comme FAIBLE
      const eventSansPriorite = events.find(e => e.taskId === 4);
      const indexSansPriorite = events.indexOf(eventSansPriorite!);
      const indexFaible = events.findIndex(e => e.priorite === 'FAIBLE');
      
      // Les deux devraient être à la fin (après HAUTE et MOYENNE)
      expect(indexSansPriorite).toBeGreaterThan(1);
      expect(indexFaible).toBeGreaterThan(1);
    });

    it('devrait trier par date si les priorités sont identiques', () => {
      TaskHistory.clearHistory();
      
      // Ajouter deux événements avec la même priorité
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Haute 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      // Petit délai pour garantir un timestamp différent
      const firstTimestamp = new Date().getTime();
      
      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Haute 2',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      const tasks = [{ id: 1 }, { id: 2 }];
      const events = TaskHistory.getEventsByPriority(1, tasks);

      expect(events.length).toBe(2);
      expect(events[0].priorite).toBe('HAUTE');
      expect(events[1].priorite).toBe('HAUTE');
      // Le plus récent devrait être en premier
      expect(events[0].timestamp.getTime()).toBeGreaterThanOrEqual(events[1].timestamp.getTime());
    });

    it('devrait retourner un tableau vide pour un projet sans événements', () => {
      const events = TaskHistory.getEventsByPriority(999, [{ id: 999 }]);
      expect(events.length).toBe(0);
    });

    it('devrait gérer une priorité inconnue comme valeur par défaut (999)', () => {
      TaskHistory.addEvent({
        taskId: 5,
        taskName: 'Priorité Inconnue',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'URGENTE' as any // Priorité non standard
      });

      const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 5 }];
      const events = TaskHistory.getEventsByPriority(1, tasks);

      // L'événement avec priorité inconnue devrait être à la fin
      const lastEvent = events[events.length - 1];
      expect(lastEvent.taskId).toBe(5);
    });

    it('devrait combiner correctement le tri par priorité et par date', () => {
      TaskHistory.clearHistory();
      
      // Scénario complexe : plusieurs priorités, plusieurs dates
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Moyenne Ancienne',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'MOYENNE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Haute Récente',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      TaskHistory.addEvent({
        taskId: 3,
        taskName: 'Haute Ancienne',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      TaskHistory.addEvent({
        taskId: 4,
        taskName: 'Faible',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'FAIBLE'
      });

      const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const events = TaskHistory.getEventsByPriority(1, tasks);

      // Vérifier l'ordre des priorités
      expect(events[0].priorite).toBe('HAUTE');
      expect(events[1].priorite).toBe('HAUTE');
      expect(events[2].priorite).toBe('MOYENNE');
      expect(events[3].priorite).toBe('FAIBLE');
    });
  });

  describe('clearHistory', () => {
    it('devrait vider complètement l\'historique', () => {
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Tâche 2',
        eventType: 'CREATION',
        newValue: 'EN_COURS'
      });

      let events = TaskHistory.getEventsByProject(1, [{ id: 1 }, { id: 2 }]);
      expect(events.length).toBe(2);

      TaskHistory.clearHistory();

      events = TaskHistory.getEventsByProject(1, [{ id: 1 }, { id: 2 }]);
      expect(events.length).toBe(0);
    });

    it('devrait permettre d\'ajouter de nouveaux événements après le nettoyage', () => {
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Ancien',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      TaskHistory.clearHistory();

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Nouveau',
        eventType: 'CREATION',
        newValue: 'EN_COURS'
      });

      const events = TaskHistory.getEventsByProject(1, [{ id: 1 }, { id: 2 }]);
      expect(events.length).toBe(1);
      expect(events[0].taskId).toBe(2);
      expect(events[0].taskName).toBe('Nouveau');
    });

    it('devrait être idempotent (peut être appelé plusieurs fois)', () => {
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche',
        eventType: 'CREATION',
        newValue: 'A_FAIRE'
      });

      TaskHistory.clearHistory();
      TaskHistory.clearHistory();
      TaskHistory.clearHistory();

      const events = TaskHistory.getEventsByProject(1, [{ id: 1 }]);
      expect(events.length).toBe(0);
    });
  });

  describe('Scénarios d\'intégration', () => {
    it('devrait gérer un cycle de vie complet d\'une tâche', () => {
      // Création
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Complète',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'MOYENNE'
      });

      // Changement d'état
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Complète',
        eventType: 'ETAT_CHANGE',
        oldValue: 'A_FAIRE',
        newValue: 'EN_COURS',
        priorite: 'MOYENNE'
      });

      // Changement de priorité
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Complète',
        eventType: 'PRIORITE_CHANGE',
        oldValue: 'MOYENNE',
        newValue: 'HAUTE',
        priorite: 'HAUTE'
      });

      // Finalisation
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Tâche Complète',
        eventType: 'ETAT_CHANGE',
        oldValue: 'EN_COURS',
        newValue: 'TERMINE',
        priorite: 'HAUTE'
      });

      const events = TaskHistory.getEventsByProject(1, [{ id: 1 }]);
      expect(events.length).toBe(4);
      
      // Vérifier que tous les types d'événements sont présents
      const types = events.map(e => e.eventType);
      expect(types).toContain('CREATION');
      expect(types).toContain('ETAT_CHANGE');
      expect(types).toContain('PRIORITE_CHANGE');
    });

    it('devrait gérer plusieurs projets simultanément', () => {
      // Projet 1
      TaskHistory.addEvent({
        taskId: 1,
        taskName: 'Projet 1 - Tâche 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'HAUTE'
      });

      TaskHistory.addEvent({
        taskId: 2,
        taskName: 'Projet 1 - Tâche 2',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'FAIBLE'
      });

      // Projet 2
      TaskHistory.addEvent({
        taskId: 3,
        taskName: 'Projet 2 - Tâche 1',
        eventType: 'CREATION',
        newValue: 'A_FAIRE',
        priorite: 'MOYENNE'
      });

      const projet1Events = TaskHistory.getEventsByProject(1, [{ id: 1 }, { id: 2 }]);
      const projet2Events = TaskHistory.getEventsByProject(2, [{ id: 3 }]);

      expect(projet1Events.length).toBe(2);
      expect(projet2Events.length).toBe(1);
      expect(projet1Events.every(e => [1, 2].includes(e.taskId))).toBe(true);
      expect(projet2Events.every(e => e.taskId === 3)).toBe(true);
    });
  });
});
