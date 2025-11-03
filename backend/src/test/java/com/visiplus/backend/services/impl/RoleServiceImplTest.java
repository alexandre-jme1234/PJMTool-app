package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.RoleRepository;
import com.visiplus.backend.models.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests unitaires pour RoleServiceImpl
 * Service simple avec deux méthodes : findByNom et save
 * Bon exemple pour comprendre les bases du test unitaire
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("Tests du service Role")
class RoleServiceImplTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleServiceImpl roleService;

    private Role roleTest;

    @BeforeEach
    void setUp() {
        roleTest = new Role();
        roleTest.setId(1);
        roleTest.setNom("ADMIN");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner un rôle existant")
    void testFindByNom_WhenRoleExists_ShouldReturnRole() {
        // Arrange
        when(roleRepository.findByNom("ADMIN")).thenReturn(roleTest);

        // Act
        Role result = roleService.findByNom("ADMIN");

        // Assert
        assertNotNull(result, "Le rôle ne devrait pas être null");
        assertEquals("ADMIN", result.getNom(), "Le nom du rôle devrait être ADMIN");
        assertEquals(1, result.getId(), "L'ID devrait être 1");
        verify(roleRepository, times(1)).findByNom("ADMIN");
    }

    @Test
    @DisplayName("findByNom - Devrait retourner null si le rôle n'existe pas")
    void testFindByNom_WhenRoleDoesNotExist_ShouldReturnNull() {
        // Arrange
        when(roleRepository.findByNom("INEXISTANT")).thenReturn(null);

        // Act
        Role result = roleService.findByNom("INEXISTANT");

        // Assert
        assertNull(result, "Le résultat devrait être null");
        verify(roleRepository, times(1)).findByNom("INEXISTANT");
    }

    @Test
    @DisplayName("save - Devrait sauvegarder un nouveau rôle")
    void testSave_ShouldSaveRole() {
        // Arrange
        Role nouveauRole = new Role();
        nouveauRole.setNom("USER");
        
        when(roleRepository.save(nouveauRole)).thenAnswer(invocation -> {
            Role saved = invocation.getArgument(0);
            saved.setId(2);
            return saved;
        });

        // Act
        Role result = roleService.save(nouveauRole);

        // Assert
        assertNotNull(result, "Le rôle sauvegardé ne devrait pas être null");
        assertEquals("USER", result.getNom(), "Le nom devrait être USER");
        assertEquals(2, result.getId(), "L'ID devrait être assigné");
        verify(roleRepository, times(1)).save(nouveauRole);
    }

    @Test
    @DisplayName("save - Devrait mettre à jour un rôle existant")
    void testSave_WhenRoleExists_ShouldUpdateRole() {
        // Arrange
        roleTest.setNom("SUPER_ADMIN");
        when(roleRepository.save(roleTest)).thenReturn(roleTest);

        // Act
        Role result = roleService.save(roleTest);

        // Assert
        assertNotNull(result, "Le rôle ne devrait pas être null");
        assertEquals("SUPER_ADMIN", result.getNom(), "Le nom devrait être mis à jour");
        assertEquals(1, result.getId(), "L'ID devrait rester le même");
        verify(roleRepository, times(1)).save(roleTest);
    }
}
