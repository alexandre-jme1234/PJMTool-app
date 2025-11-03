package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Utilisateur;
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
 * Tests unitaires pour UtilisateurServiceImpl
 * Service gérant les utilisateurs avec logique métier complexe
 * Points d'apprentissage :
 * - Tester les transactions (@Transactional)
 * - Gérer les exceptions personnalisées
 * - Tester la mise à jour partielle avec vérification de nullité
 * - Éviter les doublons lors de la création
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service Utilisateur")
class UtilisateurServiceImplTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private UtilisateurServiceImpl utilisateurService;

    private Utilisateur utilisateurTest;

    @BeforeEach
    void setUp() {
        utilisateurTest = new Utilisateur();
        utilisateurTest.setId(1);
        utilisateurTest.setNom("Jean Dupont");
        utilisateurTest.setEmail("jean.dupont@example.com");
        utilisateurTest.setEtat_connexion(false);
    }

    @Test
    @DisplayName("findAll - Devrait retourner tous les utilisateurs")
    void testFindAll_ShouldReturnAllUtilisateurs() {
        // Arrange
        Utilisateur user2 = new Utilisateur();
        user2.setId(2);
        user2.setNom("Marie Martin");
        user2.setEmail("marie.martin@example.com");

        List<Utilisateur> utilisateurs = Arrays.asList(utilisateurTest, user2);
        when(utilisateurRepository.findAll()).thenReturn(utilisateurs);

        // Act
        List<Utilisateur> result = utilisateurService.findAll();

        // Assert
        assertNotNull(result, "La liste ne devrait pas être null");
        assertEquals(2, result.size(), "La liste devrait contenir 2 utilisateurs");
        assertEquals("Jean Dupont", result.get(0).getNom(), "Le premier utilisateur devrait être Jean");
        assertEquals("Marie Martin", result.get(1).getNom(), "Le deuxième utilisateur devrait être Marie");
        verify(utilisateurRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("create - Devrait créer un nouvel utilisateur si inexistant")
    void testCreate_WhenUserDoesNotExist_ShouldCreateNew() {
        // Arrange
        when(utilisateurRepository.findByNom("Jean Dupont")).thenReturn(Optional.empty());
        when(utilisateurRepository.save(utilisateurTest)).thenReturn(utilisateurTest);

        // Act
        int result = utilisateurService.create(utilisateurTest);

        // Assert
        assertEquals(1, result, "L'ID de l'utilisateur créé devrait être 1");
        verify(utilisateurRepository, times(1)).findByNom("Jean Dupont");
        verify(utilisateurRepository, times(1)).save(utilisateurTest);
    }

    @Test
    @DisplayName("create - Devrait retourner l'ID existant si utilisateur déjà présent")
    void testCreate_WhenUserExists_ShouldReturnExistingId() {
        // Arrange
        when(utilisateurRepository.findByNom("Jean Dupont")).thenReturn(Optional.of(utilisateurTest));

        // Act
        int result = utilisateurService.create(utilisateurTest);

        // Assert
        assertEquals(1, result, "L'ID existant devrait être retourné");
        verify(utilisateurRepository, times(1)).findByNom("Jean Dupont");
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("findById - Devrait retourner un utilisateur existant")
    void testFindById_WhenUserExists_ShouldReturnUser() {
        // Arrange
        when(utilisateurRepository.findById(1)).thenReturn(Optional.of(utilisateurTest));

        // Act
        Utilisateur result = utilisateurService.findById(1);

        // Assert
        assertNotNull(result, "L'utilisateur ne devrait pas être null");
        assertEquals("Jean Dupont", result.getNom(), "Le nom devrait correspondre");
        assertEquals("jean.dupont@example.com", result.getEmail(), "L'email devrait correspondre");
        verify(utilisateurRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("findById - Devrait lancer une exception si utilisateur inexistant")
    void testFindById_WhenUserDoesNotExist_ShouldThrowException() {
        // Arrange
        when(utilisateurRepository.findById(999)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            utilisateurService.findById(999);
        });

        assertTrue(exception.getMessage().contains("Utilisateur non trouvé avec id 999"),
                "Le message d'erreur devrait mentionner l'ID");
        verify(utilisateurRepository, times(1)).findById(999);
    }

    @Test
    @DisplayName("findByNom - Devrait retourner un utilisateur par son nom")
    void testFindByNom_WhenUserExists_ShouldReturnUser() {
        // Arrange
        when(utilisateurRepository.findByNom("Jean Dupont")).thenReturn(Optional.of(utilisateurTest));

        // Act
        Utilisateur result = utilisateurService.findByNom("Jean Dupont");

        // Assert
        assertNotNull(result, "L'utilisateur ne devrait pas être null");
        assertEquals("Jean Dupont", result.getNom(), "Le nom devrait correspondre");
        verify(utilisateurRepository, times(1)).findByNom("Jean Dupont");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner null si utilisateur inexistant")
    void testFindByNom_WhenUserDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(utilisateurRepository.findByNom("Inexistant")).thenReturn(Optional.empty());

        // Act
        Utilisateur result = utilisateurService.findByNom("Inexistant");

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(utilisateurRepository, times(1)).findByNom("Inexistant");
    }

    @Test
    @DisplayName("findByEmail - Devrait retourner un utilisateur par son email")
    void testFindByEmail_WhenUserExists_ShouldReturnUser() {
        // Arrange
        when(utilisateurRepository.findByEmail("jean.dupont@example.com"))
                .thenReturn(Optional.of(utilisateurTest));

        // Act
        Utilisateur result = utilisateurService.findByEmail("jean.dupont@example.com");

        // Assert
        assertNotNull(result, "L'utilisateur ne devrait pas être null");
        assertEquals("jean.dupont@example.com", result.getEmail(), "L'email devrait correspondre");
        verify(utilisateurRepository, times(1)).findByEmail("jean.dupont@example.com");
    }

    @Test
    @DisplayName("findByEmail - Devrait retourner null si email inexistant")
    void testFindByEmail_WhenEmailDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(utilisateurRepository.findByEmail("inexistant@example.com")).thenReturn(Optional.empty());

        // Act
        Utilisateur result = utilisateurService.findByEmail("inexistant@example.com");

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(utilisateurRepository, times(1)).findByEmail("inexistant@example.com");
    }

    @Test
    @DisplayName("updatePartial - Devrait mettre à jour l'état de connexion si modifié")
    void testUpdatePartial_WhenEtatConnexionChanged_ShouldUpdate() {
        // Arrange
        Utilisateur newUtilisateur = new Utilisateur();
        newUtilisateur.setEtat_connexion(true);

        when(utilisateurRepository.save(utilisateurTest)).thenReturn(utilisateurTest);

        // Act
        Utilisateur result = utilisateurService.updatePartial(1, utilisateurTest, newUtilisateur);

        // Assert
        assertNotNull(result, "L'utilisateur mis à jour ne devrait pas être null");
        assertTrue(utilisateurTest.getEtat_connexion(), "L'état de connexion devrait être true");
        verify(utilisateurRepository, times(1)).save(utilisateurTest);
    }

    @Test
    @DisplayName("updatePartial - Ne devrait pas modifier si état de connexion identique")
    void testUpdatePartial_WhenEtatConnexionUnchanged_ShouldNotModify() {
        // Arrange
        Utilisateur newUtilisateur = new Utilisateur();
        newUtilisateur.setEtat_connexion(false);

        when(utilisateurRepository.save(utilisateurTest)).thenReturn(utilisateurTest);

        // Act
        Utilisateur result = utilisateurService.updatePartial(1, utilisateurTest, newUtilisateur);

        // Assert
        assertNotNull(result, "L'utilisateur devrait être retourné");
        assertFalse(utilisateurTest.getEtat_connexion(), "L'état de connexion devrait rester false");
        verify(utilisateurRepository, times(1)).save(utilisateurTest);
    }

    @Test
    @DisplayName("updatePartial - Devrait retourner null si newUtilisateur est null")
    void testUpdatePartial_WhenNewUtilisateurIsNull_ShouldReturnNull() {
        // Act
        Utilisateur result = utilisateurService.updatePartial(1, utilisateurTest, null);

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("updatePartial - Devrait retourner null si utilisateurExistant est null")
    void testUpdatePartial_WhenUtilisateurExistantIsNull_ShouldReturnNull() {
        // Arrange
        Utilisateur newUtilisateur = new Utilisateur();
        newUtilisateur.setEtat_connexion(true);

        // Act
        Utilisateur result = utilisateurService.updatePartial(1, null, newUtilisateur);

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(utilisateurRepository, never()).save(any(Utilisateur.class));
    }

    @Test
    @DisplayName("save - Devrait sauvegarder un utilisateur")
    void testSave_ShouldSaveUtilisateur() {
        // Arrange
        when(utilisateurRepository.save(utilisateurTest)).thenReturn(utilisateurTest);

        // Act
        Utilisateur result = utilisateurService.save(utilisateurTest);

        // Assert
        assertNotNull(result, "L'utilisateur sauvegardé ne devrait pas être null");
        assertEquals("Jean Dupont", result.getNom(), "Le nom devrait correspondre");
        verify(utilisateurRepository, times(1)).save(utilisateurTest);
    }
}
