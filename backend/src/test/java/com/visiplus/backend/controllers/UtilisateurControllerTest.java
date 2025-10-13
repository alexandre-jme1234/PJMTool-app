package com.visiplus.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.visiplus.backend.dto.LoginRequest;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.RoleService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests unitaires pour UtilisateurController avec @WebMvcTest
 * 
 * Objectif pédagogique:
 * - Tester l'authentification et la gestion des utilisateurs
 * - Comprendre la gestion de l'état de connexion
 * - Apprendre à tester les opérations d'association (utilisateur-projet-rôle)
 */
@WebMvcTest(UtilisateurController.class)
@DisplayName("Tests du UtilisateurController")
class UtilisateurControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UtilisateurService utilisateurService;

    @MockBean
    private UserRoleProjetService userRoleProjetService;

    @MockBean
    private RoleService roleService;

    @MockBean
    private ProjetService projetService;

    private Utilisateur utilisateurTest;
    private Role roleMembre;
    private Projet projetTest;

    @BeforeEach
    void setUp() {
        // Préparation de l'utilisateur
        utilisateurTest = new Utilisateur();
        utilisateurTest.setId(1);
        utilisateurTest.setNom("TestUser");
        utilisateurTest.setEmail("test@test.com");
        utilisateurTest.setPassword("password123");
        utilisateurTest.setEtat_connexion(false);
        utilisateurTest.setRole_app("MEMBRE");

        // Préparation du rôle
        roleMembre = new Role();
        roleMembre.setId(1);
        roleMembre.setNom("MEMBRE");

        // Préparation du projet
        projetTest = new Projet();
        projetTest.setId(1);
        projetTest.setNom("Projet Test");
    }

    /**
     * Test 1: Création d'un utilisateur avec succès
     * 
     * Scénario:
     * - Création d'un nouvel utilisateur dans le système
     * - Attribution automatique du rôle "MEMBRE" par défaut
     * - Validation des champs obligatoires (nom, email)
     * 
     * Points d'apprentissage:
     * - Validation des données d'entrée
     * - Gestion des valeurs par défaut
     * - Test de création d'entité
     */
    @Test
    @DisplayName("POST /api/utilisateur/create - Création réussie d'un utilisateur")
    void testCreateUtilisateur_Success() throws Exception {
        // ARRANGE
        String userJson = "{\"nom\":\"NouvelUtilisateur\",\"email\":\"nouveau@test.com\",\"password\":\"password\"}";

        // Configuration des mocks
        // Le service create() retourne l'ID de l'utilisateur créé
        when(roleService.findByNom("MEMBRE")).thenReturn(roleMembre);
        when(utilisateurService.create(any(Utilisateur.class))).thenReturn(2);

        // ACT & ASSERT
        // Le controller retourne directement l'ID (int) dans le body
        mockMvc.perform(post("/api/utilisateur/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isOk())
                .andExpect(content().string("2")); // Vérifie que l'ID 2 est retourné

        verify(roleService, times(1)).findByNom("MEMBRE");
        verify(utilisateurService, times(1)).create(any(Utilisateur.class));
    }

    /**
     * Test 2: Connexion d'un utilisateur (Login)
     * 
     * Scénario:
     * - Un utilisateur se connecte avec email et mot de passe
     * - Le système vérifie les credentials
     * - L'état de connexion est mis à jour à true
     * 
     * Points d'apprentissage:
     * - Test d'authentification
     * - Gestion de l'état de session
     * - Vérification des credentials
     * - Mise à jour partielle d'entité
     */
    @Test
    @DisplayName("PATCH /api/utilisateur/login - Connexion réussie")
    void testLogin_Success() throws Exception {
        // ARRANGE
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password123");

        Utilisateur connectedUser = new Utilisateur();
        connectedUser.setId(1);
        connectedUser.setNom("TestUser");
        connectedUser.setEmail("test@test.com");
        connectedUser.setPassword("password123");
        connectedUser.setEtat_connexion(true);

        // Configuration des mocks
        when(utilisateurService.findByEmail("test@test.com")).thenReturn(utilisateurTest);
        when(utilisateurService.updatePartial(anyInt(), any(Utilisateur.class), any(Utilisateur.class)))
                .thenReturn(connectedUser);

        // ACT & ASSERT
        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nom").value("TestUser"))
                .andExpect(jsonPath("$.etat_connexion").value(true));

        verify(utilisateurService, times(1)).findByEmail("test@test.com");
        verify(utilisateurService, times(1)).updatePartial(anyInt(), any(Utilisateur.class), any(Utilisateur.class));
    }

    /**
     * Test 3: Ajout d'un utilisateur à un projet avec un rôle
     * 
     * Scénario:
     * - Ajout d'un utilisateur existant à un projet
     * - Attribution d'un rôle dans le contexte du projet
     * - Création de la relation UserRoleProjet
     * 
     * Points d'apprentissage:
     * - Gestion des relations many-to-many avec table de jointure
     * - Attribution de rôles contextuels (différents par projet)
     * - Validation de l'existence des entités liées
     */
    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Ajout réussi d'un utilisateur à un projet")
    void testAddUtilisateurToProject_Success() throws Exception {
        // ARRANGE
        String requestJson = "{\"nom\":\"TestUser\",\"role_app\":\"MEMBRE\"}";

        UserRoleProjet urp = new UserRoleProjet();
        urp.setUtilisateur(utilisateurTest);
        urp.setProjet(projetTest);
        urp.setRole(roleMembre);

        // Configuration des mocks
        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(roleService.findByNom("MEMBRE")).thenReturn(roleMembre);
        when(userRoleProjetService.save(any(UserRoleProjet.class))).thenReturn(urp);
        when(utilisateurService.save(any(Utilisateur.class))).thenReturn(utilisateurTest);

        // ACT & ASSERT
        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Utilisateur Roled bien ajouté au projet"));

        verify(projetService, times(1)).findById(1);
        verify(utilisateurService, times(1)).findByNom("TestUser");
        verify(roleService, times(1)).findByNom("MEMBRE");
        verify(userRoleProjetService, times(1)).save(any(UserRoleProjet.class));
    }

    /**
     * BONUS: Test de validation - Login avec mauvais mot de passe
     * 
     * Scénario:
     * - Tentative de connexion avec un mot de passe incorrect
     * - Le système refuse la connexion
     * - L'état de connexion reste à false
     * 
     * Points d'apprentissage:
     * - Test de sécurité
     * - Gestion des erreurs d'authentification
     * - Codes de statut HTTP appropriés (401 Unauthorized)
     */
    @Test
    @DisplayName("PATCH /api/utilisateur/login - Échec avec mauvais mot de passe")
    void testLogin_WrongPassword() throws Exception {
        // ARRANGE
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("wrongpassword");

        when(utilisateurService.findByEmail("test@test.com")).thenReturn(utilisateurTest);

        // ACT & ASSERT
        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());

        verify(utilisateurService, times(1)).findByEmail("test@test.com");
        verify(utilisateurService, never()).updatePartial(anyInt(), any(Utilisateur.class), any(Utilisateur.class));
    }

    /**
     * BONUS: Test de déconnexion (Logout)
     * 
     * Scénario:
     * - Un utilisateur connecté se déconnecte
     * - L'état de connexion passe à false
     * 
     * Points d'apprentissage:
     * - Gestion de la déconnexion
     * - Mise à jour de l'état de session
     */
    @Test
    @DisplayName("PATCH /api/utilisateur/logout - Déconnexion réussie")
    void testLogout_Success() throws Exception {
        // ARRANGE
        String requestJson = "{\"email\":\"test@test.com\"}";
        
        Utilisateur connectedUser = new Utilisateur();
        connectedUser.setId(1);
        connectedUser.setEmail("test@test.com");
        connectedUser.setEtat_connexion(true);

        Utilisateur disconnectedUser = new Utilisateur();
        disconnectedUser.setId(1);
        disconnectedUser.setEmail("test@test.com");
        disconnectedUser.setEtat_connexion(false);

        when(utilisateurService.findByEmail("test@test.com")).thenReturn(connectedUser);
        when(utilisateurService.updatePartial(anyInt(), any(Utilisateur.class), any(Utilisateur.class)))
                .thenReturn(disconnectedUser);

        // ACT & ASSERT
        mockMvc.perform(patch("/api/utilisateur/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Utilisateur bien déconnecté"))
                .andExpect(jsonPath("$.data.etat_connexion").value(false));

        verify(utilisateurService, times(1)).findByEmail("test@test.com");
        verify(utilisateurService, times(1)).updatePartial(anyInt(), any(Utilisateur.class), any(Utilisateur.class));
    }

    /**
     * BONUS: Test de validation - Création sans champs obligatoires
     * 
     * Scénario:
     * - Tentative de création d'un utilisateur sans nom ou email
     * - Le système refuse la création
     * 
     * Points d'apprentissage:
     * - Validation des données obligatoires
     * - Gestion des erreurs de validation
     */
    @Test
    @DisplayName("POST /api/utilisateur/create - Échec si champs obligatoires manquants")
    void testCreateUtilisateur_MissingFields() throws Exception {
        // ARRANGE
        String invalidUserJson = "{\"password\":\"password\"}";

        // ACT & ASSERT
        mockMvc.perform(post("/api/utilisateur/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidUserJson))
                .andExpect(status().isBadRequest());

        verify(utilisateurService, never()).create(any(Utilisateur.class));
    }
}
