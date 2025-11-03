package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UserRoleProjetRepository;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.Projet;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour UserRoleProjetImpl
 * Service gérant les associations entre utilisateurs, rôles et projets
 * Points d'apprentissage :
 * - Tester des entités de relation (table de jointure)
 * - Manipuler des objets composites
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service UserRoleProjet")
class UserRoleProjetImplTest {

    @Mock
    private UserRoleProjetRepository userRoleProjetRepository;

    @InjectMocks
    private UserRoleProjetImpl userRoleProjetService;

    private UserRoleProjet userRoleProjetTest;
    private Utilisateur utilisateur;
    private Role role;
    private Projet projet;

    @BeforeEach
    void setUp() {
        // Création d'un utilisateur
        utilisateur = new Utilisateur();
        utilisateur.setId(1);
        utilisateur.setNom("Jean Dupont");
        utilisateur.setEmail("jean.dupont@example.com");

        // Création d'un rôle
        role = new Role();
        role.setId(1);
        role.setNom("DEVELOPER");

        // Création d'un projet
        projet = new Projet();
        projet.setId(1);
        projet.setNom("Projet Alpha");

        // Création de l'association
        userRoleProjetTest = new UserRoleProjet();
        userRoleProjetTest.setId(1L);
        userRoleProjetTest.setUtilisateur(utilisateur);
        userRoleProjetTest.setRole(role);
        userRoleProjetTest.setProjet(projet);
    }

    @Test
    @DisplayName("save - Devrait sauvegarder une nouvelle association utilisateur-rôle-projet")
    void testSave_ShouldSaveUserRoleProjet() {
        // Arrange
        when(userRoleProjetRepository.save(userRoleProjetTest)).thenReturn(userRoleProjetTest);

        // Act
        UserRoleProjet result = userRoleProjetService.save(userRoleProjetTest);

        // Assert
        assertNotNull(result, "L'association ne devrait pas être null");
        assertEquals(1L, result.getId(), "L'ID devrait être 1");
        assertEquals("Jean Dupont", result.getUtilisateur().getNom(), "Le nom de l'utilisateur devrait correspondre");
        assertEquals("DEVELOPER", result.getRole().getNom(), "Le nom du rôle devrait correspondre");
        assertEquals("Projet Alpha", result.getProjet().getNom(), "Le nom du projet devrait correspondre");
        verify(userRoleProjetRepository, times(1)).save(userRoleProjetTest);
    }

    @Test
    @DisplayName("save - Devrait mettre à jour une association existante")
    void testSave_WhenAssociationExists_ShouldUpdate() {
        // Arrange
        // Changement du rôle
        Role newRole = new Role();
        newRole.setId(2);
        newRole.setNom("ADMIN");
        userRoleProjetTest.setRole(newRole);

        when(userRoleProjetRepository.save(userRoleProjetTest)).thenReturn(userRoleProjetTest);

        // Act
        UserRoleProjet result = userRoleProjetService.save(userRoleProjetTest);

        // Assert
        assertNotNull(result, "L'association ne devrait pas être null");
        assertEquals("ADMIN", result.getRole().getNom(), "Le rôle devrait être mis à jour");
        verify(userRoleProjetRepository, times(1)).save(userRoleProjetTest);
    }

    @Test
    @DisplayName("findAll - Devrait retourner toutes les associations")
    void testFindAll_ShouldReturnAllAssociations() {
        // Arrange
        UserRoleProjet association2 = new UserRoleProjet();
        association2.setId(2L);
        
        Utilisateur user2 = new Utilisateur();
        user2.setId(2);
        user2.setNom("Marie Martin");
        
        association2.setUtilisateur(user2);
        association2.setRole(role);
        association2.setProjet(projet);

        List<UserRoleProjet> associations = Arrays.asList(userRoleProjetTest, association2);
        when(userRoleProjetRepository.findAll()).thenReturn(associations);

        // Act
        List<UserRoleProjet> result = userRoleProjetService.findALl();

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertEquals(2, result.size(), "La liste devrait contenir 2 associations");
        assertEquals("Jean Dupont", result.get(0).getUtilisateur().getNom(), "Le premier utilisateur devrait être Jean");
        assertEquals("Marie Martin", result.get(1).getUtilisateur().getNom(), "Le deuxième utilisateur devrait être Marie");
        verify(userRoleProjetRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Devrait retourner une liste vide si aucune association")
    void testFindAll_WhenNoAssociations_ShouldReturnEmptyList() {
        // Arrange
        when(userRoleProjetRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<UserRoleProjet> result = userRoleProjetService.findALl();

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertTrue(result.isEmpty(), "La liste devrait être vide");
        verify(userRoleProjetRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("save - Devrait gérer correctement les associations multiples pour un même utilisateur")
    void testSave_MultipleAssociationsForSameUser_ShouldWork() {
        // Arrange
        // Même utilisateur, même rôle, mais projet différent
        Projet projet2 = new Projet();
        projet2.setId(2);
        projet2.setNom("Projet Beta");

        UserRoleProjet association2 = new UserRoleProjet();
        association2.setId(2L);
        association2.setUtilisateur(utilisateur);
        association2.setRole(role);
        association2.setProjet(projet2);

        when(userRoleProjetRepository.save(association2)).thenReturn(association2);

        // Act
        UserRoleProjet result = userRoleProjetService.save(association2);

        // Assert
        assertNotNull(result, "L'association ne devrait pas être null");
        assertEquals("Jean Dupont", result.getUtilisateur().getNom(), "L'utilisateur devrait être le même");
        assertEquals("Projet Beta", result.getProjet().getNom(), "Le projet devrait être différent");
        verify(userRoleProjetRepository, times(1)).save(association2);
    }
}
