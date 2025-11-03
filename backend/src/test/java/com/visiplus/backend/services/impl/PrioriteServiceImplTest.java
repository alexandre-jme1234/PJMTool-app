package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.PrioriteRepository;
import com.visiplus.backend.models.Priorite;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour PrioriteServiceImpl
 * Objectif pédagogique : Comprendre comment tester une couche service
 * en isolant les dépendances avec Mockito
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service Priorite")
class PrioriteServiceImplTest {

    @Mock
    private PrioriteRepository prioriteRepository;

    @InjectMocks
    private PrioriteServiceImpl prioriteService;

    private Priorite prioriteTest;

    @BeforeEach
    void setUp() {
        // Arrange : Préparation des données de test
        prioriteTest = new Priorite();
        prioriteTest.setId(1);
        prioriteTest.setNom("Haute");
    }

    @Test
    @DisplayName("findById - Devrait retourner une priorité existante")
    void testFindById_WhenPrioriteExists_ShouldReturnPriorite() {
        // Arrange
        when(prioriteRepository.findById(1)).thenReturn(Optional.of(prioriteTest));

        // Act
        Optional<Priorite> result = prioriteService.findById(1);

        // Assert
        assertTrue(result.isPresent(), "La priorité devrait être trouvée");
        assertEquals("Haute", result.get().getNom(), "Le nom devrait correspondre");
        verify(prioriteRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("findById - Devrait retourner Optional.empty si priorité inexistante")
    void testFindById_WhenPrioriteDoesNotExist_ShouldReturnEmpty() {
        // Arrange
        when(prioriteRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<Priorite> result = prioriteService.findById(999);

        // Assert
        assertFalse(result.isPresent(), "Aucune priorité ne devrait être trouvée");
        verify(prioriteRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("findByNom - Devrait retourner une priorité par son nom")
    void testFindByNom_WhenPrioriteExists_ShouldReturnPriorite() {
        // Arrange
        when(prioriteRepository.findFirstByNom("Haute")).thenReturn(prioriteTest);

        // Act
        Priorite result = prioriteService.findByNom("Haute");

        // Assert
        assertNotNull(result, "La priorité ne devrait pas être null");
        assertEquals("Haute", result.getNom(), "Le nom devrait correspondre");
        verify(prioriteRepository, times(1)).findFirstByNom("Haute");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner null si priorité inexistante")
    void testFindByNom_WhenPrioriteDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(prioriteRepository.findFirstByNom("Inexistante")).thenReturn(null);

        // Act
        Priorite result = prioriteService.findByNom("Inexistante");

        // Assert
        assertNull(result, "La priorité devrait être null");
        verify(prioriteRepository, times(1)).findFirstByNom("Inexistante");
    }

    @Test
    @DisplayName("create - Devrait créer une nouvelle priorité si elle n'existe pas")
    void testCreate_WhenPrioriteDoesNotExist_ShouldCreateNew() {
        // Arrange
        Priorite nouvellePriorite = new Priorite();
        nouvellePriorite.setNom("Moyenne");
        
        when(prioriteRepository.findFirstByNom("Moyenne")).thenReturn(null);
        when(prioriteRepository.save(nouvellePriorite)).thenAnswer(invocation -> {
            Priorite saved = invocation.getArgument(0);
            saved.setId(2);
            return saved;
        });

        // Act
        int result = prioriteService.create(nouvellePriorite);

        // Assert
        assertEquals(2, result, "L'ID de la nouvelle priorité devrait être 2");
        verify(prioriteRepository, times(1)).findFirstByNom("Moyenne");
        verify(prioriteRepository, times(1)).save(nouvellePriorite);
    }

    @Test
    @DisplayName("create - Devrait retourner l'ID existant si priorité déjà présente")
    void testCreate_WhenPrioriteExists_ShouldReturnExistingId() {
        // Arrange
        when(prioriteRepository.findFirstByNom("Haute")).thenReturn(prioriteTest);

        // Act
        int result = prioriteService.create(prioriteTest);

        // Assert
        assertEquals(1, result, "L'ID existant devrait être retourné");
        verify(prioriteRepository, times(1)).findFirstByNom("Haute");
        verify(prioriteRepository, never()).save(any(Priorite.class));
    }

    @Test
    @DisplayName("save - Devrait sauvegarder une priorité")
    void testSave_ShouldSavePriorite() {
        // Arrange
        when(prioriteRepository.save(prioriteTest)).thenReturn(prioriteTest);

        // Act
        Priorite result = prioriteService.save(prioriteTest);

        // Assert
        assertNotNull(result, "La priorité sauvegardée ne devrait pas être null");
        assertEquals("Haute", result.getNom(), "Le nom devrait correspondre");
        verify(prioriteRepository, times(1)).save(prioriteTest);
    }

    @Test
    @DisplayName("delete - Devrait supprimer une priorité")
    void testDelete_ShouldDeletePriorite() {
        // Arrange
        doNothing().when(prioriteRepository).delete(prioriteTest);

        // Act
        prioriteService.delete(prioriteTest);

        // Assert
        verify(prioriteRepository, times(1)).delete(prioriteTest);
    }
}
