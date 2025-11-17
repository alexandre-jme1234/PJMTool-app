package com.visiplus.backend.dto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests unitaires pour TacheRequest DTO
 * 
 * Objectif pédagogique:
 * - Tester un DTO complexe avec plusieurs champs (9 attributs)
 * - Comprendre comment tester la méthode toString()
 * - Apprendre à tester des objets avec des types variés (String, Integer, Date)
 * 
 * Ce DTO est utilisé pour créer/modifier des tâches via l'API REST.
 * Il contient des IDs de relations (destinataire, projet, commanditaire, priorité).
 */
@DisplayName("Tests du DTO TacheRequest")
class TacheRequestTest {

    private TacheRequest tacheRequest;

    @BeforeEach
    void setUp() {
        tacheRequest = new TacheRequest();
    }

    // ========== Tests du constructeur ==========

    @Test
    @DisplayName("Devrait créer un TacheRequest vide")
    void testDefaultConstructor() {
        // Arrange & Act
        TacheRequest request = new TacheRequest();

        // Assert
        assertNotNull(request, "L'objet ne devrait pas être null");
        assertEquals(0, request.getId(), "L'ID devrait être 0 par défaut");
        assertNull(request.getNom(), "Le nom devrait être null par défaut");
        assertNull(request.getDescription(), "La description devrait être null par défaut");
    }

    // ========== Tests des getters/setters ==========

    @Test
    @DisplayName("Devrait définir et récupérer l'ID correctement")
    void testSetAndGetId() {
        // Arrange
        int expectedId = 42;

        // Act
        tacheRequest.setId(expectedId);

        // Assert
        assertEquals(expectedId, tacheRequest.getId(), "L'ID devrait correspondre");
    }

    @Test
    @DisplayName("Devrait définir et récupérer le nom correctement")
    void testSetAndGetNom() {
        // Arrange
        String expectedNom = "Développer la fonctionnalité X";

        // Act
        tacheRequest.setNom(expectedNom);

        // Assert
        assertEquals(expectedNom, tacheRequest.getNom(), "Le nom devrait correspondre");
    }

    @Test
    @DisplayName("Devrait définir et récupérer la description correctement")
    void testSetAndGetDescription() {
        // Arrange
        String expectedDescription = "Description détaillée de la tâche";

        // Act
        tacheRequest.setDescription(expectedDescription);

        // Assert
        assertEquals(expectedDescription, tacheRequest.getDescription());
    }

    @Test
    @DisplayName("Devrait définir et récupérer le destinataire_id correctement")
    void testSetAndGetDestinataireId() {
        // Arrange
        Integer expectedId = 10;

        // Act
        tacheRequest.setDestinataire_id(expectedId);

        // Assert
        assertEquals(expectedId, tacheRequest.getDestinataire_id());
    }

    @Test
    @DisplayName("Devrait définir et récupérer le projet_id correctement")
    void testSetAndGetProjetId() {
        // Arrange
        Integer expectedId = 5;

        // Act
        tacheRequest.setProjet_id(expectedId);

        // Assert
        assertEquals(expectedId, tacheRequest.getProjet_id());
    }

    @Test
    @DisplayName("Devrait définir et récupérer le commanditaire_id correctement")
    void testSetAndGetCommanditaireId() {
        // Arrange
        Integer expectedId = 3;

        // Act
        tacheRequest.setCommanditaire_id(expectedId);

        // Assert
        assertEquals(expectedId, tacheRequest.getCommanditaire_id());
    }

    @Test
    @DisplayName("Devrait définir et récupérer la date_debut correctement")
    void testSetAndGetDateDebut() {
        // Arrange
        Date expectedDate = new Date();

        // Act
        tacheRequest.setDate_debut(expectedDate);

        // Assert
        assertEquals(expectedDate, tacheRequest.getDate_debut());
    }

    @Test
    @DisplayName("Devrait définir et récupérer la date_fin correctement")
    void testSetAndGetDateFin() {
        // Arrange
        Date expectedDate = new Date();

        // Act
        tacheRequest.setDate_fin(expectedDate);

        // Assert
        assertEquals(expectedDate, tacheRequest.getDate_fin());
    }

    @Test
    @DisplayName("Devrait définir et récupérer la priorite_id correctement")
    void testSetAndGetPrioriteId() {
        // Arrange
        Integer expectedId = 2;

        // Act
        tacheRequest.setPriorite_id(expectedId);

        // Assert
        assertEquals(expectedId, tacheRequest.getPriorite_id());
    }

    @Test
    @DisplayName("Devrait définir et récupérer l'état correctement")
    void testSetAndGetEtat() {
        // Arrange
        String expectedEtat = "EN_COURS";

        // Act
        tacheRequest.setEtat(expectedEtat);

        // Assert
        assertEquals(expectedEtat, tacheRequest.getEtat());
    }

    // ========== Tests avec tous les champs ==========

    @Test
    @DisplayName("Devrait gérer tous les champs ensemble")
    void testAllFieldsTogether() {
        // Arrange
        int id = 1;
        String nom = "Tâche de test";
        String description = "Description de test";
        Integer destinataireId = 10;
        Integer projetId = 5;
        Integer commanditaireId = 3;
        Date dateDebut = new Date();
        Date dateFin = new Date(System.currentTimeMillis() + 86400000);
        Integer prioriteId = 2;
        String etat = "A_FAIRE";

        // Act
        tacheRequest.setId(id);
        tacheRequest.setNom(nom);
        tacheRequest.setDescription(description);
        tacheRequest.setDestinataire_id(destinataireId);
        tacheRequest.setProjet_id(projetId);
        tacheRequest.setCommanditaire_id(commanditaireId);
        tacheRequest.setDate_debut(dateDebut);
        tacheRequest.setDate_fin(dateFin);
        tacheRequest.setPriorite_id(prioriteId);
        tacheRequest.setEtat(etat);

        // Assert
        assertAll("Vérification de tous les champs",
            () -> assertEquals(id, tacheRequest.getId()),
            () -> assertEquals(nom, tacheRequest.getNom()),
            () -> assertEquals(description, tacheRequest.getDescription()),
            () -> assertEquals(destinataireId, tacheRequest.getDestinataire_id()),
            () -> assertEquals(projetId, tacheRequest.getProjet_id()),
            () -> assertEquals(commanditaireId, tacheRequest.getCommanditaire_id()),
            () -> assertEquals(dateDebut, tacheRequest.getDate_debut()),
            () -> assertEquals(dateFin, tacheRequest.getDate_fin()),
            () -> assertEquals(prioriteId, tacheRequest.getPriorite_id()),
            () -> assertEquals(etat, tacheRequest.getEtat())
        );
    }

    // ========== Tests des cas limites (amélioration couverture de branches) ==========

    @Test
    @DisplayName("Devrait gérer les valeurs null")
    void testNullValues() {
        // Arrange & Act
        tacheRequest.setNom(null);
        tacheRequest.setDescription(null);
        tacheRequest.setDestinataire_id(null);
        tacheRequest.setEtat(null);

        // Assert
        assertAll("Vérification des valeurs null",
            () -> assertNull(tacheRequest.getNom()),
            () -> assertNull(tacheRequest.getDescription()),
            () -> assertNull(tacheRequest.getDestinataire_id()),
            () -> assertNull(tacheRequest.getEtat())
        );
    }

    @Test
    @DisplayName("Devrait gérer les chaînes vides")
    void testEmptyStrings() {
        // Arrange & Act
        tacheRequest.setNom("");
        tacheRequest.setDescription("");
        tacheRequest.setEtat("");

        // Assert
        assertAll("Vérification des chaînes vides",
            () -> assertEquals("", tacheRequest.getNom()),
            () -> assertEquals("", tacheRequest.getDescription()),
            () -> assertEquals("", tacheRequest.getEtat())
        );
    }

    @Test
    @DisplayName("Devrait gérer des IDs à zéro")
    void testZeroIds() {
        // Arrange & Act
        tacheRequest.setId(0);
        tacheRequest.setDestinataire_id(0);
        tacheRequest.setProjet_id(0);

        // Assert
        assertEquals(0, tacheRequest.getId());
        assertEquals(0, tacheRequest.getDestinataire_id());
        assertEquals(0, tacheRequest.getProjet_id());
    }

    // ========== Tests de la méthode toString() ==========

    @Test
    @DisplayName("toString() devrait retourner une chaîne non null")
    void testToStringNotNull() {
        // Act
        String result = tacheRequest.toString();

        // Assert
        assertNotNull(result, "toString() ne devrait pas retourner null");
    }

    @Test
    @DisplayName("toString() devrait contenir le nom de la classe")
    void testToStringContainsClassName() {
        // Act
        String result = tacheRequest.toString();

        // Assert
        assertTrue(result.contains("TacheRequest"), 
            "toString() devrait contenir le nom de la classe");
    }

    @Test
    @DisplayName("toString() devrait contenir les valeurs des champs")
    void testToStringContainsFieldValues() {
        // Arrange
        tacheRequest.setNom("Ma tâche");
        tacheRequest.setDescription("Description test");
        tacheRequest.setEtat("EN_COURS");

        // Act
        String result = tacheRequest.toString();

        // Assert
        assertTrue(result.contains("Ma tâche"), "Devrait contenir le nom");
        assertTrue(result.contains("Description test"), "Devrait contenir la description");
        assertTrue(result.contains("EN_COURS"), "Devrait contenir l'état");
    }

    @Test
    @DisplayName("toString() devrait gérer les valeurs null")
    void testToStringWithNullValues() {
        // Act
        String result = tacheRequest.toString();

        // Assert
        assertNotNull(result, "toString() ne devrait pas crasher avec des valeurs null");
        assertTrue(result.contains("null"), "toString() devrait afficher 'null'");
    }
}
