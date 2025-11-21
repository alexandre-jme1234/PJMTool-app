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

    // ========== Tests pour getProjectByNom ==========

    /**
     * Test: Récupération d'un projet par nom - Succès
     * Branche: projet != null (ligne 50)
     */
    @Test
    @DisplayName("GET /api/projet/nom/{nom} - Récupération d'un projet existant par nom")
    void testGetProjectByNom_Success() throws Exception {
        // ARRANGE
        when(projetService.findByNom("Projet Test")).thenReturn(projetTest);

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/nom/Projet Test")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Projet a été trouvé"))
                .andExpect(jsonPath("$.data.nom").value("Projet Test"));

        verify(projetService, times(1)).findByNom("Projet Test");
    }

    /**
     * Test: Récupération d'un projet par nom - Échec
     * Branche: projet == null (ligne 50)
     */
    @Test
    @DisplayName("GET /api/projet/nom/{nom} - Projet inexistant par nom")
    void testGetProjectByNom_NotFound() throws Exception {
        // ARRANGE
        when(projetService.findByNom("ProjetInexistant")).thenReturn(null);

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/nom/ProjetInexistant")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Projet n'existe pas"));

        verify(projetService, times(1)).findByNom("ProjetInexistant");
    }

    // ========== Tests pour getUsersRoledByProject ==========

    /**
     * Test: Récupération des utilisateurs avec rôles - Liste vide
     * Branche: projets.isEmpty() == true (ligne 76)
     */
    @Test
    @DisplayName("GET /api/projet/users-roled/{id} - Aucun UserRoleProjet trouvé")
    void testGetUsersRoledByProject_EmptyList() throws Exception {
        // ARRANGE
        when(userRoleProjetService.findALl()).thenReturn(java.util.Collections.emptyList());

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/users-roled/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Aucun Projet trouvé"));

        verify(userRoleProjetService, times(1)).findALl();
    }

    /**
     * Test: Récupération des utilisateurs avec rôles - Succès avec filtrage
     * Branche: projets.isEmpty() == false (ligne 76)
     */
    @Test
    @DisplayName("GET /api/projet/users-roled/{id} - Récupération avec filtrage")
    void testGetUsersRoledByProject_Success() throws Exception {
        // ARRANGE
        UserRoleProjet urp1 = new UserRoleProjet();
        urp1.setProjet(projetTest);
        urp1.setUtilisateur(utilisateurTest);
        urp1.setRole(roleAdmin);

        Projet autreProjet = new Projet();
        autreProjet.setId(2);
        autreProjet.setNom("Autre Projet");

        UserRoleProjet urp2 = new UserRoleProjet();
        urp2.setProjet(autreProjet);
        urp2.setUtilisateur(utilisateurTest);
        urp2.setRole(roleAdmin);

        when(userRoleProjetService.findALl()).thenReturn(java.util.Arrays.asList(urp1, urp2));

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/users-roled/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User Roled Projet Trouvé"))
                .andExpect(jsonPath("$.data").isArray());

        verify(userRoleProjetService, times(1)).findALl();
    }

    // ========== Tests pour createProject - Branches manquantes ==========

    /**
     * Test: Création de projet - Utilisateur inexistant
     * Branche: userProject == null (ligne 104)
     */
    @Test
    @DisplayName("POST /api/projet/create - Échec si utilisateur inexistant")
    void testCreateProject_UserNotFound() throws Exception {
        // ARRANGE
        ProjetRequest request = new ProjetRequest();
        request.setNom("Nouveau Projet");
        request.setCreateur("UtilisateurInconnu");

        when(utilisateurService.findByNom("UtilisateurInconnu")).thenReturn(null);

        // ACT & ASSERT
        mockMvc.perform(post("/api/projet/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Utilisateur n'est pas connu ou le nom n'est pas le bon"));

        verify(projetService, never()).create(any(Projet.class));
    }

    /**
     * Test: Création de projet - Projet déjà existant
     * Branche: projetExistant != null (ligne 118)
     */
    @Test
    @DisplayName("POST /api/projet/create - Échec si projet existe déjà")
    void testCreateProject_ProjectAlreadyExists() throws Exception {
        // ARRANGE
        ProjetRequest request = new ProjetRequest();
        request.setNom("Projet Test");
        request.setCreateur("TestUser");

        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(projetService.findByNom("Projet Test")).thenReturn(projetTest); // Projet existe déjà

        // ACT & ASSERT
        mockMvc.perform(post("/api/projet/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Le projet existe déjà"))
                .andExpect(jsonPath("$.data.nom").value("Projet Test"));

        verify(projetService, never()).create(any(Projet.class));
    }

    // ========== Tests pour deleteProject - Branches manquantes ==========

    /**
     * Test: Suppression de projet - Projet inexistant
     * Branche: projet == null (ligne 159)
     */
    @Test
    @DisplayName("DELETE /api/projet/delete/{id} - Échec si projet inexistant")
    void testDeleteProject_NotFound() throws Exception {
        // ARRANGE
        when(projetService.findById(999)).thenReturn(null);

        // ACT & ASSERT
        mockMvc.perform(delete("/api/projet/delete/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Projet n'existe pas"));

        verify(projetService, times(1)).findById(999);
        verify(projetService, never()).delete(any(Projet.class));
    }

    /**
     * Test: Suppression de projet - Exception lors de la suppression
     * Branche: catch (Exception e) (ligne 176)
     */
    @Test
    @DisplayName("DELETE /api/projet/delete/{id} - Erreur lors de la suppression")
    void testDeleteProject_Exception() throws Exception {
        // ARRANGE
        when(projetService.findById(1)).thenReturn(projetTest);
        when(projetService.delete(any(Projet.class)))
                .thenThrow(new RuntimeException("Erreur de contrainte FK"));

        // ACT & ASSERT
        mockMvc.perform(delete("/api/projet/delete/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Erreur lors de la suppression: Erreur de contrainte FK"));

        verify(projetService, times(1)).findById(1);
        verify(projetService, times(1)).delete(projetTest);
    }

    // ========== Tests pour getAllProjects ==========

    /**
     * Test: Récupération de tous les projets
     * Teste la transformation en DTO et la réponse
     */
    @Test
    @DisplayName("GET /api/projet/all - Récupération de tous les projets")
    void testGetAllProjects_Success() throws Exception {
        // ARRANGE
        Projet projet2 = new Projet();
        projet2.setId(2);
        projet2.setNom("Projet 2");
        projet2.setDescription("Description 2");
        projet2.setDate_creation(new Date());

        when(projetService.findAll()).thenReturn(java.util.Arrays.asList(projetTest, projet2));

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Liste des projets"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].nom").value("Projet Test"))
                .andExpect(jsonPath("$.data[1].nom").value("Projet 2"));

        verify(projetService, times(1)).findAll();
    }

    /**
     * Test: Récupération de tous les projets - Liste vide
     * Teste le cas où aucun projet n'existe
     */
    @Test
    @DisplayName("GET /api/projet/all - Liste vide")
    void testGetAllProjects_EmptyList() throws Exception {
        // ARRANGE
        when(projetService.findAll()).thenReturn(java.util.Collections.emptyList());

        // ACT & ASSERT
        mockMvc.perform(get("/api/projet/all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Liste des projets"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));

        verify(projetService, times(1)).findAll();
    }
}
