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

    // ========== Tests pour findAll ==========

    @Test
    @DisplayName("GET /api/utilisateur/ - Récupération de tous les utilisateurs")
    void testFindAll_Success() throws Exception {
        when(utilisateurService.findAll()).thenReturn(java.util.Arrays.asList(utilisateurTest));

        mockMvc.perform(get("/api/utilisateur/")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].nom").value("TestUser"));

        verify(utilisateurService, times(1)).findAll();
    }

    // ========== Tests pour findById ==========

    @Test
    @DisplayName("GET /api/utilisateur/{id} - Récupération par ID")
    void testFindById_Success() throws Exception {
        when(utilisateurService.findById(1)).thenReturn(utilisateurTest);

        mockMvc.perform(get("/api/utilisateur/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.nom").value("TestUser"));

        verify(utilisateurService, times(1)).findById(1);
    }

    // ========== Tests pour findByNom ==========

    @Test
    @DisplayName("GET /api/utilisateur/nom - Récupération par nom")
    void testFindByNom_Success() throws Exception {
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);

        mockMvc.perform(get("/api/utilisateur/nom")
                .param("nom", "TestUser")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("TestUser"));

        verify(utilisateurService, times(1)).findByNom("TestUser");
    }

    // ========== Tests pour CreateUtilisateur - Branches manquantes ==========

    @Test
    @DisplayName("POST /api/utilisateur/create - Création avec rôle spécifié")
    void testCreateUtilisateur_WithCustomRole() throws Exception {
        String userJson = "{\"nom\":\"Admin\",\"email\":\"admin@test.com\",\"role_app\":\"ADMINISTRATEUR\"}";

        Role roleAdmin = new Role();
        roleAdmin.setId(2);
        roleAdmin.setNom("ADMINISTRATEUR");

        when(roleService.findByNom("ADMINISTRATEUR")).thenReturn(roleAdmin);
        when(utilisateurService.create(any(Utilisateur.class))).thenReturn(3);

        mockMvc.perform(post("/api/utilisateur/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));

        verify(roleService, times(1)).findByNom("ADMINISTRATEUR");
        verify(utilisateurService, times(1)).create(any(Utilisateur.class));
    }

    @Test
    @DisplayName("POST /api/utilisateur/create - Échec si rôle spécifié n'existe pas")
    void testCreateUtilisateur_RoleNotFound() throws Exception {
        String userJson = "{\"nom\":\"User\",\"email\":\"user@test.com\",\"role_app\":\"ROLE_INEXISTANT\"}";

        when(roleService.findByNom("ROLE_INEXISTANT")).thenReturn(null);

        mockMvc.perform(post("/api/utilisateur/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Le rôle spécifié n'existe pas"));

        verify(utilisateurService, never()).create(any(Utilisateur.class));
    }

    @Test
    @DisplayName("POST /api/utilisateur/create - Échec si rôle MEMBRE par défaut introuvable")
    void testCreateUtilisateur_DefaultRoleNotFound() throws Exception {
        String userJson = "{\"nom\":\"User\",\"email\":\"user@test.com\"}";

        when(roleService.findByNom("MEMBRE")).thenReturn(null);

        mockMvc.perform(post("/api/utilisateur/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(userJson))
                .andExpect(status().isInternalServerError())
                .andExpect(content().string("Le rôle 'MEMBRE' est introuvable"));

        verify(utilisateurService, never()).create(any(Utilisateur.class));
    }

    // ========== Tests pour login - Branches manquantes ==========

    @Test
    @DisplayName("PATCH /api/utilisateur/login - Échec si email null")
    void testLogin_EmailNull() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(null);
        loginRequest.setPassword("password");

        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("email & password manquant"));

        verify(utilisateurService, never()).findByEmail(any());
    }

    @Test
    @DisplayName("PATCH /api/utilisateur/login - Échec si password null")
    void testLogin_PasswordNull() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword(null);

        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("email & password manquant"));

        verify(utilisateurService, never()).findByEmail(any());
    }

    @Test
    @DisplayName("PATCH /api/utilisateur/login - Échec si utilisateur non trouvé")
    void testLogin_UserNotFound() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("inconnu@test.com");
        loginRequest.setPassword("password");

        when(utilisateurService.findByEmail("inconnu@test.com")).thenReturn(null);

        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Utilisateur non trouvé"));

        verify(utilisateurService, times(1)).findByEmail("inconnu@test.com");
        verify(utilisateurService, never()).updatePartial(anyInt(), any(), any());
    }

    @Test
    @DisplayName("PATCH /api/utilisateur/login - Exception")
    void testLogin_Exception() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@test.com");
        loginRequest.setPassword("password");

        when(utilisateurService.findByEmail("test@test.com"))
                .thenThrow(new RuntimeException("Erreur DB"));

        mockMvc.perform(patch("/api/utilisateur/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isInternalServerError());
    }

    // ========== Tests pour AddUtilisateurTOProject - Branches manquantes ==========

    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Échec si projet non trouvé")
    void testAddUtilisateurToProject_ProjetNotFound() throws Exception {
        String requestJson = "{\"nom\":\"TestUser\"}";

        when(projetService.findById(999)).thenReturn(null);
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);

        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Utilisateur ou projet non trouvé"));

        verify(userRoleProjetService, never()).save(any());
    }

    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Échec si utilisateur non trouvé")
    void testAddUtilisateurToProject_UtilisateurNotFound() throws Exception {
        String requestJson = "{\"nom\":\"Inconnu\"}";

        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findByNom("Inconnu")).thenReturn(null);

        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Utilisateur ou projet non trouvé"));

        verify(userRoleProjetService, never()).save(any());
    }

    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Rôle null, fallback vers MEMBRE")
    void testAddUtilisateurToProject_RoleNullFallback() throws Exception {
        String requestJson = "{\"nom\":\"TestUser\"}";

        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(roleService.findByNom("MEMBRE")).thenReturn(roleMembre);
        when(userRoleProjetService.save(any(UserRoleProjet.class))).thenReturn(new UserRoleProjet());
        when(utilisateurService.save(any(Utilisateur.class))).thenReturn(utilisateurTest);

        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(roleService, times(1)).findByNom("MEMBRE");
    }

    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Rôle demandé inexistant, fallback MEMBRE")
    void testAddUtilisateurToProject_RoleNotFoundFallback() throws Exception {
        String requestJson = "{\"nom\":\"TestUser\",\"role_app\":\"ROLE_INEXISTANT\"}";

        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(roleService.findByNom("ROLE_INEXISTANT")).thenReturn(null);
        when(roleService.findByNom("MEMBRE")).thenReturn(roleMembre);
        when(userRoleProjetService.save(any(UserRoleProjet.class))).thenReturn(new UserRoleProjet());
        when(utilisateurService.save(any(Utilisateur.class))).thenReturn(utilisateurTest);

        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(roleService, times(1)).findByNom("ROLE_INEXISTANT");
        verify(roleService, times(1)).findByNom("MEMBRE");
    }

    @Test
    @DisplayName("POST /api/utilisateur/add-user-to-project - Échec si MEMBRE introuvable")
    void testAddUtilisateurToProject_MembreRoleNotFound() throws Exception {
        String requestJson = "{\"nom\":\"TestUser\"}";

        when(projetService.findById(1)).thenReturn(projetTest);
        when(utilisateurService.findByNom("TestUser")).thenReturn(utilisateurTest);
        when(roleService.findByNom("MEMBRE")).thenReturn(null);

        mockMvc.perform(post("/api/utilisateur/add-user-to-project")
                .param("id", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Le rôle MEMBRE n'existe pas dans la base de données"));

        verify(userRoleProjetService, never()).save(any());
    }

    // ========== Tests pour logout - Branches manquantes ==========

    @Test
    @DisplayName("PATCH /api/utilisateur/logout - Échec si utilisateur non trouvé")
    void testLogout_UserNotFound() throws Exception {
        String requestJson = "{\"email\":\"inconnu@test.com\"}";

        when(utilisateurService.findByEmail("inconnu@test.com")).thenReturn(null);

        mockMvc.perform(patch("/api/utilisateur/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Utilisateur non trouvé"));

        verify(utilisateurService, never()).updatePartial(anyInt(), any(), any());
    }

    @Test
    @DisplayName("PATCH /api/utilisateur/logout - Échec si utilisateur déjà déconnecté")
    void testLogout_AlreadyDisconnected() throws Exception {
        String requestJson = "{\"email\":\"test@test.com\"}";

        Utilisateur disconnectedUser = new Utilisateur();
        disconnectedUser.setId(1);
        disconnectedUser.setEmail("test@test.com");
        disconnectedUser.setEtat_connexion(false);

        when(utilisateurService.findByEmail("test@test.com")).thenReturn(disconnectedUser);

        mockMvc.perform(patch("/api/utilisateur/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isNotModified())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Déconnexion échouée, utilisateur déjà déconnecté"));

        verify(utilisateurService, never()).updatePartial(anyInt(), any(), any());
    }

    @Test
    @DisplayName("PATCH /api/utilisateur/logout - Exception")
    void testLogout_Exception() throws Exception {
        String requestJson = "{\"email\":\"test@test.com\"}";

        when(utilisateurService.findByEmail("test@test.com"))
                .thenThrow(new RuntimeException("Erreur DB"));

        mockMvc.perform(patch("/api/utilisateur/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Erreur interne"));
    }
}
