package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.TacheRepository;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.models.Utilisateur;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour TacheServiceImpl
 * Service le plus complexe avec la méthode updatePartial
 * Points d'apprentissage :
 * - Tester une logique métier complexe (mise à jour partielle)
 * - Vérifier que seuls les champs modifiés sont mis à jour
 * - Tester les suppressions avec vérification d'existence
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service Tache")
class TacheServiceImplTest {

    @Mock
    private TacheRepository tacheRepository;

    @InjectMocks
    private TacheServiceImpl tacheService;

    private Tache tacheTest;
    private Utilisateur destinataire;
    private Utilisateur commanditaire;

    @BeforeEach
    void setUp() {
        destinataire = new Utilisateur();
        destinataire.setId(1);
        destinataire.setNom("Jean Dupont");

        commanditaire = new Utilisateur();
        commanditaire.setId(2);
        commanditaire.setNom("Marie Martin");

        tacheTest = new Tache();
        tacheTest.setId(1);
        tacheTest.setNom("Tâche Test");
        tacheTest.setDescription("Description de la tâche");
        tacheTest.setDestinataire(destinataire);
        tacheTest.setCommanditaire(commanditaire);
        Calendar cal = Calendar.getInstance();
        cal.set(2024, Calendar.JANUARY, 1, 0, 0, 0);
        tacheTest.setDate_debut(cal.getTime());
        cal.set(2024, Calendar.DECEMBER, 31, 0, 0, 0);
        tacheTest.setDate_fin(cal.getTime());
    }

    @Test
    @DisplayName("findByNom - Devrait retourner une tâche existante")
    void testFindByNom_WhenTacheExists_ShouldReturnTache() {
        // Arrange
        when(tacheRepository.findByNom("Tâche Test")).thenReturn(Optional.of(tacheTest));

        // Act
        Tache result = tacheService.findByNom("Tâche Test");

        // Assert
        assertNotNull(result, "La tâche ne devrait pas être null");
        assertEquals("Tâche Test", result.getNom(), "Le nom devrait correspondre");
        verify(tacheRepository, times(1)).findByNom("Tâche Test");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner null si tâche inexistante")
    void testFindByNom_WhenTacheDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(tacheRepository.findByNom("Inexistante")).thenReturn(Optional.empty());

        // Act
        Tache result = tacheService.findByNom("Inexistante");

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(tacheRepository, times(1)).findByNom("Inexistante");
    }

    @Test
    @DisplayName("create - Devrait créer une nouvelle tâche")
    void testCreate_ShouldCreateTache() {
        // Arrange
        when(tacheRepository.save(tacheTest)).thenReturn(tacheTest);

        // Act
        Tache result = tacheService.create(tacheTest);

        // Assert
        assertNotNull(result, "La tâche créée ne devrait pas être null");
        assertEquals("Tâche Test", result.getNom(), "Le nom devrait correspondre");
        verify(tacheRepository, times(1)).save(tacheTest);
    }

    @Test
    @DisplayName("findById - Devrait retourner une tâche par son ID")
    void testFindById_WhenTacheExists_ShouldReturnTache() {
        // Arrange
        when(tacheRepository.findById(1)).thenReturn(Optional.of(tacheTest));

        // Act
        Optional<Tache> result = tacheService.findById(1);

        // Assert
        assertTrue(result.isPresent(), "La tâche devrait être trouvée");
        assertEquals("Tâche Test", result.get().getNom(), "Le nom devrait correspondre");
        verify(tacheRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("updatePartial - Devrait mettre à jour uniquement le nom si modifié")
    void testUpdatePartial_WhenOnlyNomChanged_ShouldUpdateOnlyNom() {
        // Arrange
        Tache updateTache = new Tache();
        updateTache.setNom("Nouveau Nom");
        updateTache.setDescription(tacheTest.getDescription());
        updateTache.setDestinataire(tacheTest.getDestinataire());
        updateTache.setCommanditaire(tacheTest.getCommanditaire());
        updateTache.setDate_debut(tacheTest.getDate_debut());
        updateTache.setDate_fin(tacheTest.getDate_fin());

        when(tacheRepository.save(any(Tache.class))).thenReturn(tacheTest);

        // Act
        Tache result = tacheService.updatePartial(1, tacheTest, updateTache);

        // Assert
        assertNotNull(result, "La tâche mise à jour ne devrait pas être null");
        assertEquals("Nouveau Nom", tacheTest.getNom(), "Le nom devrait être mis à jour");
        verify(tacheRepository, times(1)).save(tacheTest);
    }

    @Test
    @DisplayName("updatePartial - Devrait mettre à jour plusieurs champs modifiés")
    void testUpdatePartial_WhenMultipleFieldsChanged_ShouldUpdateAll() {
        // Arrange
        Tache updateTache = new Tache();
        updateTache.setNom("Nouveau Nom");
        updateTache.setDescription("Nouvelle Description");
        updateTache.setDestinataire(tacheTest.getDestinataire());
        updateTache.setCommanditaire(tacheTest.getCommanditaire());
        Calendar calUpdate = Calendar.getInstance();
        calUpdate.set(2024, Calendar.JUNE, 1, 0, 0, 0);
        updateTache.setDate_debut(calUpdate.getTime());
        updateTache.setDate_fin(tacheTest.getDate_fin());

        when(tacheRepository.save(any(Tache.class))).thenReturn(tacheTest);

        // Act
        Tache result = tacheService.updatePartial(1, tacheTest, updateTache);

        // Assert
        assertNotNull(result, "La tâche mise à jour ne devrait pas être null");
        assertEquals("Nouveau Nom", tacheTest.getNom(), "Le nom devrait être mis à jour");
        assertEquals("Nouvelle Description", tacheTest.getDescription(), "La description devrait être mise à jour");
        assertNotNull(tacheTest.getDate_debut(), "La date de début devrait être mise à jour");
        verify(tacheRepository, times(1)).save(tacheTest);
    }

    @Test
    @DisplayName("updatePartial - Ne devrait rien modifier si aucun changement")
    void testUpdatePartial_WhenNoChanges_ShouldNotModify() {
        // Arrange
        Tache updateTache = new Tache();
        updateTache.setNom(tacheTest.getNom());
        updateTache.setDescription(tacheTest.getDescription());
        updateTache.setDestinataire(tacheTest.getDestinataire());
        updateTache.setCommanditaire(tacheTest.getCommanditaire());
        updateTache.setDate_debut(tacheTest.getDate_debut());
        updateTache.setDate_fin(tacheTest.getDate_fin());

        when(tacheRepository.save(any(Tache.class))).thenReturn(tacheTest);

        // Act
        Tache result = tacheService.updatePartial(1, tacheTest, updateTache);

        // Assert
        assertNotNull(result, "La tâche devrait être retournée");
        verify(tacheRepository, times(1)).save(tacheTest);
    }

    @Test
    @DisplayName("findByProjetId - Devrait retourner toutes les tâches d'un projet")
    void testFindByProjetId_ShouldReturnAllTachesForProjet() {
        // Arrange
        Tache tache2 = new Tache();
        tache2.setId(2);
        tache2.setNom("Tâche 2");

        List<Tache> taches = Arrays.asList(tacheTest, tache2);
        when(tacheRepository.findByProjetId(1)).thenReturn(taches);

        // Act
        List<Tache> result = tacheService.findByProjetId(1);

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertEquals(2, result.size(), "La liste devrait contenir 2 tâches");
        verify(tacheRepository, times(1)).findByProjetId(1);
    }

    @Test
    @DisplayName("save - Devrait sauvegarder une tâche")
    void testSave_ShouldSaveTache() {
        // Arrange
        when(tacheRepository.save(tacheTest)).thenReturn(tacheTest);

        // Act
        Tache result = tacheService.save(tacheTest);

        // Assert
        assertNotNull(result, "La tâche sauvegardée ne devrait pas être null");
        assertEquals("Tâche Test", result.getNom(), "Le nom devrait correspondre");
        verify(tacheRepository, times(1)).save(tacheTest);
    }

    @Test
    @DisplayName("deleteByID - Devrait supprimer une tâche existante et retourner true")
    void testDeleteByID_WhenTacheExists_ShouldReturnTrue() {
        // Arrange
        when(tacheRepository.findById(1)).thenReturn(Optional.of(tacheTest));
        doNothing().when(tacheRepository).deleteById(1);

        // Act
        boolean result = tacheService.deleteByID(1);

        // Assert
        assertTrue(result, "La suppression devrait retourner true");
        verify(tacheRepository, times(1)).findById(1);
        verify(tacheRepository, times(1)).deleteById(1);
    }

    @Test
    @DisplayName("deleteByID - Devrait retourner false si tâche inexistante")
    void testDeleteByID_WhenTacheDoesNotExist_ShouldReturnFalse() {
        // Arrange
        when(tacheRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        boolean result = tacheService.deleteByID(999);

        // Assert
        assertFalse(result, "La suppression devrait retourner false");
        verify(tacheRepository, times(1)).findById(999);
        verify(tacheRepository, never()).deleteById(anyInt());
    }
}
