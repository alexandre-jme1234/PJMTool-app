package com.visiplus.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visiplus.backend.dto.TacheRequest;
import com.visiplus.backend.models.Priorite;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.PrioriteService;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.TacheService;
import com.visiplus.backend.services.UtilisateurService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests unitaires pour TacheController avec @WebMvcTest
 * 
 * Objectif pédagogique:
 * - Tester les opérations CRUD sur les tâches
 * - Comprendre la gestion des relations entre entités (Tache-Projet-Utilisateur)
 * - Apprendre à tester les mises à jour partielles (PATCH)
 */
@WebMvcTest(TacheController.class)
@DisplayName("Tests du TacheController")
class TacheControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TacheService tacheService;

    @MockBean
    private ProjetService projetService;

    @MockBean
    private UtilisateurService utilisateurService;

    @MockBean
    private PrioriteService prioriteService;

    private Tache tacheTest;
    private Projet projetTest;
    private Utilisateur commanditaireTest;
    private Utilisateur destinataireTest;
    private Priorite prioriteTest;

    @BeforeEach
    void setUp() {
        // Préparation des utilisateurs
        commanditaireTest = new Utilisateur();
        commanditaireTest.setId(1);
        commanditaireTest.setNom("Commanditaire");
        commanditaireTest.setEmail("commanditaire@test.com");

        destinataireTest = new Utilisateur();
        destinataireTest.setId(2);
        destinataireTest.setNom("Destinataire");
        destinataireTest.setEmail("destinataire@test.com");

        // Préparation du projet
        projetTest = new Projet();
        projetTest.setId(1);
        projetTest.setNom("Projet Test");

        // Préparation de la priorité
        prioriteTest = new Priorite();
        prioriteTest.setId(1);
        prioriteTest.setNom("HAUTE");

        // Préparation de la tâche
        tacheTest = new Tache();
        tacheTest.setId(1);
        tacheTest.setNom("Tache Test");
        tacheTest.setDescription("Description de la tâche");
        tacheTest.setEtat("TODO");
        tacheTest.setProjet(projetTest);
        tacheTest.setCommanditaire(commanditaireTest);
        tacheTest.setDestinataire(destinataireTest);
        tacheTest.setPriorite(prioriteTest);
        tacheTest.setDate_debut(new Date());
        tacheTest.setDate_fin(new Date());
    }

    /**
     * Test 1: Création d'une tâche avec succès
     * 
     * Scénario:
     * - Création d'une nouvelle tâche dans un projet
     * - Vérification que tous les éléments requis sont présents
     * - La tâche est assignée à un destinataire par un commanditaire
     * 
     * Points d'apprentissage:
     * - Gestion des relations entre entités
     * - Validation des données d'entrée
     * - Assignation automatique de l'état par défaut (TODO)
     */
    @Test
    @DisplayName("POST /api/tache/create - Création réussie d'une tâche")
    void testCreateTache_Success() throws Exception {
        // ARRANGE
        TacheRequest request = new TacheRequest();
        request.setNom("Nouvelle Tache");
        request.setDescription("Description");
        request.setProjet_id(1);
        request.setCommanditaire_id(1);
        request.setDestinataire_id(2);
        request.setEtat("TODO");
        request.setDate_fin(new Date());
        request.setPriorite_id(1);

        // Configuration des mocks
        Tache nouvelleTache = new Tache();
        nouvelleTache.setId(2);
        nouvelleTache.setNom("Nouvelle Tache");
        nouvelleTache.setDescription("Description");
        nouvelleTache.setEtat("TODO");
        nouvelleTache.setProjet(projetTest);
        nouvelleTache.setCommanditaire(commanditaireTest);
        nouvelleTache.setDestinataire(destinataireTest);
        nouvelleTache.setPriorite(prioriteTest);
        
        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findById(1)).thenReturn(commanditaireTest);
        when(utilisateurService.findById(2)).thenReturn(destinataireTest);
        when(tacheService.findByNom("Nouvelle Tache")).thenReturn(null); // Tâche n'existe pas
        when(prioriteService.findById(1)).thenReturn(Optional.of(prioriteTest));
        when(tacheService.create(any(Tache.class))).thenReturn(nouvelleTache);

        // ACT & ASSERT
        mockMvc.perform(post("/api/tache/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tache bien créé dans un projet"))
                .andExpect(jsonPath("$.data.nom").value("Nouvelle Tache"));

        // Vérifications des appels
        verify(projetService, times(1)).findById(1);
        verify(utilisateurService, times(1)).findById(1);
        verify(utilisateurService, times(1)).findById(2);
        verify(tacheService, times(1)).create(any(Tache.class));
    }

    /**
     * Test 2: Mise à jour partielle d'une tâche (PATCH)
     * 
     * Scénario:
     * - Modification de certains champs d'une tâche existante
     * - Seuls les champs fournis sont mis à jour
     * - Les autres champs conservent leur valeur
     * 
     * Points d'apprentissage:
     * - Différence entre PUT (remplacement complet) et PATCH (mise à jour partielle)
     * - Gestion des champs optionnels
     * - Validation que seuls les champs modifiés sont traités
     */
    @Test
    @DisplayName("PATCH /api/tache/update - Mise à jour partielle d'une tâche")
    void testPatchTache_Success() throws Exception {
        // ARRANGE
        TacheRequest request = new TacheRequest();
        request.setId(1);
        request.setEtat("IN_PROGRESS"); // Changement d'état uniquement
        request.setDescription("Nouvelle description");

        Tache tacheUpdated = new Tache();
        tacheUpdated.setId(1);
        tacheUpdated.setNom("Tache Test");
        tacheUpdated.setEtat("IN_PROGRESS");
        tacheUpdated.setDescription("Nouvelle description");

        // Configuration des mocks
        when(tacheService.findById(1)).thenReturn(Optional.of(tacheTest));
        when(tacheService.save(any(Tache.class))).thenReturn(tacheUpdated);

        // ACT & ASSERT
        mockMvc.perform(patch("/api/tache/update")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tache bien mise à jour"))
                .andExpect(jsonPath("$.data.etat").value("IN_PROGRESS"));

        verify(tacheService, times(1)).findById(1);
        verify(tacheService, times(1)).save(any(Tache.class));
    }

    /**
     * Test 3: Récupération des tâches d'un projet
     * 
     * Scénario:
     * - Récupération de toutes les tâches associées à un projet
     * - Utile pour afficher le backlog ou le tableau Kanban
     * 
     * Points d'apprentissage:
     * - Test de récupération de collections
     * - Vérification de la taille et du contenu des listes
     * - Utilisation de jsonPath pour tester des tableaux
     */
    @Test
    @DisplayName("GET /api/tache/project/{id} - Récupération des tâches d'un projet")
    void testGetTachesByProjectId_Success() throws Exception {
        // ARRANGE
        Tache tache2 = new Tache();
        tache2.setId(2);
        tache2.setNom("Tache 2");
        tache2.setProjet(projetTest);

        List<Tache> taches = Arrays.asList(tacheTest, tache2);
        when(tacheService.findByProjetId(1)).thenReturn(taches);

        // ACT & ASSERT
        mockMvc.perform(get("/api/tache/project/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tâches du projet"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].nom").value("Tache Test"))
                .andExpect(jsonPath("$.data[1].nom").value("Tache 2"));

        verify(tacheService, times(1)).findByProjetId(1);
    }

    /**
     * BONUS: Test de validation - Tâche déjà existante
     * 
     * Scénario:
     * - Tentative de création d'une tâche avec un nom déjà utilisé
     * - Le système refuse la création pour éviter les doublons
     * 
     * Points d'apprentissage:
     * - Validation de l'unicité des données
     * - Gestion des contraintes métier
     */
    @Test
    @DisplayName("POST /api/tache/create - Échec si tâche existe déjà")
    void testCreateTache_AlreadyExists() throws Exception {
        // ARRANGE
        TacheRequest request = new TacheRequest();
        request.setNom("Tache Test");
        request.setProjet_id(1);
        request.setCommanditaire_id(1);
        request.setDestinataire_id(2);

        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findById(1)).thenReturn(commanditaireTest);
        when(utilisateurService.findById(2)).thenReturn(destinataireTest);
        when(tacheService.findByNom("Tache Test")).thenReturn(tacheTest); // Tâche existe déjà

        // ACT & ASSERT
        mockMvc.perform(post("/api/tache/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Requette de Tache erronée ou existe deja"));

        verify(tacheService, never()).create(any(Tache.class));
    }

    /**
     * BONUS: Test de suppression d'une tâche
     * 
     * Scénario:
     * - Suppression d'une tâche existante
     * - Vérification que la suppression est effectuée
     * 
     * Points d'apprentissage:
     * - Test d'une route DELETE
     * - Gestion du retour booléen de suppression
     */
    @Test
    @DisplayName("DELETE /api/tache/delete/{id} - Suppression réussie d'une tâche")
    void testDeleteTache_Success() throws Exception {
        // ARRANGE
        when(tacheService.findById(1)).thenReturn(Optional.of(tacheTest));
        when(tacheService.deleteByID(1)).thenReturn(true);

        // ACT & ASSERT
        mockMvc.perform(delete("/api/tache/delete/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Tache a été trouvé"))
                .andExpect(jsonPath("$.data").value(true));

        verify(tacheService, times(1)).findById(1);
        verify(tacheService, times(1)).deleteByID(1);
    }
}
