package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.ProjetRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour ProjetServiceImpl
 * Points d'apprentissage :
 * - Tester les méthodes CRUD
 * - Gérer les cas où Optional est vide
 * - Vérifier les interactions avec le repository
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service Projet")
class ProjetServiceImplTest {

    @Mock
    private ProjetRepository projetRepository;

    @InjectMocks
    private ProjetServiceImpl projetService;

    private Projet projetTest;

    @BeforeEach
    void setUp() {
        projetTest = new Projet();
        projetTest.setId(1);
        projetTest.setNom("Projet Alpha");
        projetTest.setDescription("Description du projet Alpha");
    }

    @Test
    @DisplayName("create - Devrait créer un nouveau projet et retourner son ID")
    void testCreate_ShouldCreateProjetAndReturnId() {
        // Arrange
        when(projetRepository.save(projetTest)).thenReturn(projetTest);

        // Act
        int result = projetService.create(projetTest);

        // Assert
        assertEquals(1, result, "L'ID du projet créé devrait être 1");
        verify(projetRepository, times(1)).save(projetTest);
    }

    @Test
    @DisplayName("findByNom - Devrait retourner un projet existant par son nom")
    void testFindByNom_WhenProjetExists_ShouldReturnProjet() {
        // Arrange
        when(projetRepository.findByNom("Projet Alpha")).thenReturn(Optional.of(projetTest));

        // Act
        Projet result = projetService.findByNom("Projet Alpha");

        // Assert
        assertNotNull(result, "Le projet ne devrait pas être null");
        assertEquals("Projet Alpha", result.getNom(), "Le nom devrait correspondre");
        verify(projetRepository, times(1)).findByNom("Projet Alpha");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner null si le projet n'existe pas")
    void testFindByNom_WhenProjetDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(projetRepository.findByNom("Projet Inexistant")).thenReturn(Optional.empty());

        // Act
        Projet result = projetService.findByNom("Projet Inexistant");

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(projetRepository, times(1)).findByNom("Projet Inexistant");
    }

    @Test
    @DisplayName("findById - Devrait retourner un projet existant par son ID")
    void testFindById_WhenProjetExists_ShouldReturnProjet() {
        // Arrange
        when(projetRepository.findById(1)).thenReturn(Optional.of(projetTest));

        // Act
        Projet result = projetService.findById(1);

        // Assert
        assertNotNull(result, "Le projet ne devrait pas être null");
        assertEquals(1, result.getId(), "L'ID devrait correspondre");
        assertEquals("Projet Alpha", result.getNom(), "Le nom devrait correspondre");
        verify(projetRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("findById - Devrait retourner null si le projet n'existe pas")
    void testFindById_WhenProjetDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(projetRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Projet result = projetService.findById(999);

        // Assert
        assertNull(result, "Le résultat devrait être null pour un ID inexistant");
        verify(projetRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("delete - Devrait supprimer un projet et le retourner")
    void testDelete_ShouldDeleteProjetAndReturnIt() {
        // Arrange
        doNothing().when(projetRepository).delete(projetTest);

        // Act
        Projet result = projetService.delete(projetTest);

        // Assert
        assertNotNull(result, "Le projet supprimé devrait être retourné");
        assertEquals("Projet Alpha", result.getNom(), "Le nom devrait correspondre");
        verify(projetRepository, times(1)).delete(projetTest);
    }

    @Test
    @DisplayName("findAll - Devrait retourner tous les projets")
    void testFindAll_ShouldReturnAllProjets() {
        // Arrange
        Projet projet2 = new Projet();
        projet2.setId(2);
        projet2.setNom("Projet Beta");
        
        List<Projet> projets = Arrays.asList(projetTest, projet2);
        when(projetRepository.findAll()).thenReturn(projets);

        // Act
        List<Projet> result = projetService.findAll();

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertEquals(2, result.size(), "La liste devrait contenir 2 projets");
        assertEquals("Projet Alpha", result.get(0).getNom(), "Le premier projet devrait être Alpha");
        assertEquals("Projet Beta", result.get(1).getNom(), "Le deuxième projet devrait être Beta");
        verify(projetRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("findAll - Devrait retourner une liste vide si aucun projet")
    void testFindAll_WhenNoProjets_ShouldReturnEmptyList() {
        // Arrange
        when(projetRepository.findAll()).thenReturn(Arrays.asList());

        // Act
        List<Projet> result = projetService.findAll();

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertTrue(result.isEmpty(), "La liste devrait être vide");
        verify(projetRepository, times(1)).findAll();
    }
}
