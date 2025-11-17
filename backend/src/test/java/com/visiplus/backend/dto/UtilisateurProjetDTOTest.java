package com.visiplus.backend.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour UtilisateurProjetDTO
 * 
 * Objectif pédagogique:
 * - Tester un DTO avec constructeur paramétré
 * - Comprendre l'importance de tester les constructeurs
 * - Apprendre à tester les associations entre entités
 * 
 * Ce DTO représente l'association entre un utilisateur et un projet.
 */
@DisplayName("Tests du DTO UtilisateurProjetDTO")
class UtilisateurProjetDTOTest {

    private UtilisateurProjetDTO utilisateurProjetDTO;

    @BeforeEach
    void setUp() {
        utilisateurProjetDTO = new UtilisateurProjetDTO(1, 10);
    }

    // ========== Tests du constructeur ==========

    @Test
    @DisplayName("Devrait créer un UtilisateurProjetDTO avec le constructeur paramétré")
    void testConstructorWithParameters() {
        // Arrange
        int expectedUtilisateurId = 5;
        int expectedProjetId = 20;

        // Act
        UtilisateurProjetDTO dto = new UtilisateurProjetDTO(expectedUtilisateurId, expectedProjetId);

        // Assert
        assertNotNull(dto, "L'objet ne devrait pas être null");
        assertEquals(expectedUtilisateurId, dto.getUtilisateur_id(), 
            "L'utilisateur_id devrait correspondre");
        assertEquals(expectedProjetId, dto.getProjet_id(), 
            "Le projet_id devrait correspondre");
    }

    @Test
    @DisplayName("Devrait créer un UtilisateurProjetDTO avec des IDs à zéro")
    void testConstructorWithZeroIds() {
        // Arrange & Act
        UtilisateurProjetDTO dto = new UtilisateurProjetDTO(0, 0);

        // Assert
        assertEquals(0, dto.getUtilisateur_id(), "L'utilisateur_id devrait être 0");
        assertEquals(0, dto.getProjet_id(), "Le projet_id devrait être 0");
    }

    @Test
    @DisplayName("Devrait créer un UtilisateurProjetDTO avec des IDs négatifs")
    void testConstructorWithNegativeIds() {
        // Arrange & Act
        UtilisateurProjetDTO dto = new UtilisateurProjetDTO(-1, -5);

        // Assert
        assertEquals(-1, dto.getUtilisateur_id(), "L'utilisateur_id devrait être -1");
        assertEquals(-5, dto.getProjet_id(), "Le projet_id devrait être -5");
    }

    // ========== Tests des getters/setters ==========

    @Test
    @DisplayName("Devrait définir et récupérer l'utilisateur_id correctement")
    void testSetAndGetUtilisateurId() {
        // Arrange
        int expectedId = 42;

        // Act
        utilisateurProjetDTO.setUtilisateur_id(expectedId);

        // Assert
        assertEquals(expectedId, utilisateurProjetDTO.getUtilisateur_id(), 
            "L'utilisateur_id devrait correspondre");
    }

    @Test
    @DisplayName("Devrait définir et récupérer le projet_id correctement")
    void testSetAndGetProjetId() {
        // Arrange
        int expectedId = 99;

        // Act
        utilisateurProjetDTO.setProjet_id(expectedId);

        // Assert
        assertEquals(expectedId, utilisateurProjetDTO.getProjet_id(), 
            "Le projet_id devrait correspondre");
    }

    @Test
    @DisplayName("Devrait modifier les deux IDs ensemble")
    void testSetBothIds() {
        // Arrange
        int newUtilisateurId = 100;
        int newProjetId = 200;

        // Act
        utilisateurProjetDTO.setUtilisateur_id(newUtilisateurId);
        utilisateurProjetDTO.setProjet_id(newProjetId);

        // Assert
        assertAll("Vérification des deux IDs",
            () -> assertEquals(newUtilisateurId, utilisateurProjetDTO.getUtilisateur_id(), 
                "L'utilisateur_id devrait être modifié"),
            () -> assertEquals(newProjetId, utilisateurProjetDTO.getProjet_id(), 
                "Le projet_id devrait être modifié")
        );
    }

    // ========== Tests des cas limites (amélioration couverture de branches) ==========

    @Test
    @DisplayName("Devrait gérer des IDs très grands")
    void testLargeIds() {
        // Arrange
        int largeUtilisateurId = Integer.MAX_VALUE;
        int largeProjetId = Integer.MAX_VALUE - 1;

        // Act
        utilisateurProjetDTO.setUtilisateur_id(largeUtilisateurId);
        utilisateurProjetDTO.setProjet_id(largeProjetId);

        // Assert
        assertEquals(largeUtilisateurId, utilisateurProjetDTO.getUtilisateur_id(), 
            "Devrait gérer les grands IDs");
        assertEquals(largeProjetId, utilisateurProjetDTO.getProjet_id(), 
            "Devrait gérer les grands IDs");
    }

    @Test
    @DisplayName("Devrait gérer des IDs très petits")
    void testSmallIds() {
        // Arrange
        int smallUtilisateurId = Integer.MIN_VALUE;
        int smallProjetId = Integer.MIN_VALUE + 1;

        // Act
        utilisateurProjetDTO.setUtilisateur_id(smallUtilisateurId);
        utilisateurProjetDTO.setProjet_id(smallProjetId);

        // Assert
        assertEquals(smallUtilisateurId, utilisateurProjetDTO.getUtilisateur_id(), 
            "Devrait gérer les petits IDs");
        assertEquals(smallProjetId, utilisateurProjetDTO.getProjet_id(), 
            "Devrait gérer les petits IDs");
    }

    @Test
    @DisplayName("Devrait maintenir l'indépendance des champs")
    void testFieldIndependence() {
        // Arrange
        int initialUtilisateurId = utilisateurProjetDTO.getUtilisateur_id();

        // Act - Modifier seulement le projet_id
        utilisateurProjetDTO.setProjet_id(999);

        // Assert - L'utilisateur_id ne devrait pas changer
        assertEquals(initialUtilisateurId, utilisateurProjetDTO.getUtilisateur_id(), 
            "L'utilisateur_id ne devrait pas être affecté par la modification du projet_id");
        assertEquals(999, utilisateurProjetDTO.getProjet_id(), 
            "Le projet_id devrait être modifié");
    }

    // ========== Tests de scénarios réels ==========

    @Test
    @DisplayName("Devrait représenter l'association d'un utilisateur à un projet")
    void testUserProjectAssociation() {
        // Arrange - Utilisateur ID 15 assigné au projet ID 7
        int userId = 15;
        int projectId = 7;

        // Act
        UtilisateurProjetDTO association = new UtilisateurProjetDTO(userId, projectId);

        // Assert
        assertAll("Vérification de l'association",
            () -> assertEquals(userId, association.getUtilisateur_id(), 
                "L'ID utilisateur devrait correspondre"),
            () -> assertEquals(projectId, association.getProjet_id(), 
                "L'ID projet devrait correspondre")
        );
    }

    @Test
    @DisplayName("Devrait permettre de réassigner un utilisateur à un autre projet")
    void testReassignUserToAnotherProject() {
        // Arrange
        UtilisateurProjetDTO association = new UtilisateurProjetDTO(10, 5);
        int newProjectId = 15;

        // Act
        association.setProjet_id(newProjectId);

        // Assert
        assertEquals(10, association.getUtilisateur_id(), 
            "L'utilisateur devrait rester le même");
        assertEquals(newProjectId, association.getProjet_id(), 
            "Le projet devrait être mis à jour");
    }
}
