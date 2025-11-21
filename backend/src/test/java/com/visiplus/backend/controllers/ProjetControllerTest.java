package com.visiplus.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visiplus.backend.dto.ProjetRequest;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.RoleService;
import com.visiplus.backend.services.TacheService;
import com.visiplus.backend.services.UserRoleProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Date;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests unitaires pour ProjetController avec @WebMvcTest
 * 
 * Objectif pédagogique:
 * - @WebMvcTest charge uniquement la couche web (pas de base de données)
 * - MockBean simule les dépendances (services)
 * - MockMvc permet de tester les endpoints HTTP sans démarrer le serveur
 */
@WebMvcTest(ProjetController.class)
@DisplayName("Tests du ProjetController")
class ProjetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProjetService projetService;

    @MockBean
    private UtilisateurService utilisateurService;

    @MockBean
    private RoleService roleService;

    @MockBean
    private UserRoleProjetService userRoleProjetService;

    @MockBean
    private TacheService tacheService;

    private Utilisateur utilisateurTest;
    private Projet projetTest;
    private Role roleAdmin;

    @BeforeEach
    void setUp() {
        // Préparation des données de test
        utilisateurTest = new Utilisateur();
        utilisateurTest.setId(1);
        utilisateurTest.setNom("TestUser");
        utilisateurTest.setEmail("test@test.com");
        utilisateurTest.setPassword("password");
        utilisateurTest.setEtat_connexion(true);

        roleAdmin = new Role();
        roleAdmin.setId(1);
        roleAdmin.setNom("ADMINISTRATEUR");

        projetTest = new Projet();
        projetTest.setId(1);
        projetTest.setNom("Projet Test");
        projetTest.setDescription("Description test");
        projetTest.setCreateur(utilisateurTest);
        projetTest.setDate_creation(new Date());
    }

    /**
     * Test 1: Création d'un projet avec succès
     * 
     * Scénario:
     * - Un utilisateur connecté crée un nouveau projet
     * - Le système vérifie que l'utilisateur existe et est connecté
     * - Le projet est créé et l'utilisateur devient administrateur
     * 
     * Points d'apprentissage:
     * - Utilisation de mockMvc.perform() pour simuler une requête HTTP POST
     * - Mockito.when() configure le comportement des mocks
     * - andExpect() vérifie les assertions sur la réponse
     */
    @Test
    @DisplayName("POST /api/projet/create - Création réussie d'un projet")
    void testCreateProject_Success() throws Exception {
        // ARRANGE - Préparation des données
        ProjetRequest request = new ProjetRequest();
        request.setNom("Nouveau Projet");
        request.setDescription("Description du projet");
        request.setCreateur("TestUser");
        request.setDate_echeance(new Date());

        // Configuration des mocks - Simulation du comportement des services
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(projetService.findByNom("Nouveau Projet")).thenReturn(null); // Projet n'existe pas
        when(roleService.findByNom("ADMINISTRATEUR")).thenReturn(roleAdmin);
        when(projetService.create(any(Projet.class))).thenReturn(1);
        when(projetService.findById(1)).thenReturn(projetTest);
        when(userRoleProjetService.save(any(UserRoleProjet.class))).thenReturn(new UserRoleProjet());

        // ACT & ASSERT - Exécution et vérification
        mockMvc.perform(post("/api/projet/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Un projet a été créé"));

        // Vérification que les services ont été appelés
        verify(utilisateurService, times(1)).findByNom("TestUser");
        verify(projetService, times(1)).create(any(Projet.class));
        verify(userRoleProjetService, times(1)).save(any(UserRoleProjet.class));
    }

    /**
     * Test 2: Récupération d'un projet par ID
     * 
     * Scénario:
     * - Recherche d'un projet existant par son ID
     * - Le système retourne les informations du projet
     * 
     * Points d'apprentissage:
     * - Test d'une route GET avec paramètre de chemin
     * - Vérification de la structure JSON de la réponse avec jsonPath
     */
    @Test
    @DisplayName("GET /api/projet/id/{id} - Récupération d'un projet existant")
    void testGetProjectById_Success() throws Exception {
        // ARRANGE
        when(projetService.findById(1)).thenReturn(projetTest);

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/id/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Projet a été trouvé"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nom").value("Projet Test"));

        verify(projetService, times(1)).findById(1);
    }

    /**
     * Test 3: Suppression d'un projet
     * 
     * Scénario:
     * - Suppression d'un projet existant
     * - Le système confirme la suppression
     * 
     * Points d'apprentissage:
     * - Test d'une route DELETE
     * - Vérification que la méthode de suppression du service est appelée
     * - Gestion du cas de succès
     */
    @Test
    @DisplayName("DELETE /api/projet/delete/{id} - Suppression réussie d'un projet")
    void testDeleteProject_Success() throws Exception {
        // ARRANGE
        when(projetService.findById(1)).thenReturn(projetTest);
        when(projetService.delete(any(Projet.class))).thenReturn(projetTest);

        // ACT & ASSERT
        mockMvc.perform(delete("/api/projet/delete/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Projet, ses tâches et ses relations ont été supprimés"));

        verify(projetService, times(1)).findById(1);
        verify(projetService, times(1)).delete(projetTest);
    }

    /**
     * BONUS: Test de cas d'erreur - Projet inexistant
     * 
     * Scénario:
     * - Tentative de récupération d'un projet qui n'existe pas
     * - Le système retourne une erreur 400
     * 
     * Points d'apprentissage:
     * - Importance de tester les cas d'erreur
     * - Vérification des codes de statut HTTP appropriés
     */
    @Test
    @DisplayName("GET /api/projet/id/{id} - Projet inexistant")
    void testGetProjectById_NotFound() throws Exception {
        // ARRANGE
        when(projetService.findById(999)).thenReturn(null);

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/id/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Projet n'existe pas"));

        verify(projetService, times(1)).findById(999);
    }

    /**
     * BONUS: Test de validation - Utilisateur non connecté
     * 
     * Scénario:
     * - Tentative de création de projet par un utilisateur non connecté
     * - Le système refuse la création
     * 
     * Points d'apprentissage:
     * - Test des règles métier (utilisateur doit être connecté)
     * - Validation des conditions préalables
     */
    @Test
    @DisplayName("POST /api/projet/create - Échec si utilisateur non connecté")
    void testCreateProject_UserNotConnected() throws Exception {
        // ARRANGE
        ProjetRequest request = new ProjetRequest();
        request.setNom("Nouveau Projet");
        request.setCreateur("TestUser");

        Utilisateur userDeconnecte = new Utilisateur();
        userDeconnecte.setNom("TestUser");
        userDeconnecte.setEtat_connexion(false); // Non connecté

        when(utilisateurService.findByNom("TestUser")).thenReturn(userDeconnecte);

        // ACT & ASSERT
        mockMvc.perform(post("/api/projet/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Utilisateur n'est pas identifié"));

        verify(projetService, never()).create(any(Projet.class));
    }
}
