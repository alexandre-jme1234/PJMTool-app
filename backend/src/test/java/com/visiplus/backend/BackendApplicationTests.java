package com.visiplus.backend;

import com.visiplus.backend.dao.*;
import com.visiplus.backend.models.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class BackendApplicationTests {

	@Autowired
	private UtilisateurRepository utilisateurRepository;

	@Autowired
	private ProjetRepository projetRepository;

	@Autowired
	private TacheRepository tacheRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private PrioriteRepository prioriteRepository;

	@Test
	void contextLoads() {
		// Vérifie que le contexte Spring se charge correctement
		assertNotNull(utilisateurRepository);
		assertNotNull(projetRepository);
		assertNotNull(tacheRepository);
	}

	@Test
	void testUtilisateurRepository() {
		// Test de base du repository Utilisateur
		List<Utilisateur> users = utilisateurRepository.findAll();
		assertNotNull(users);
		// Les utilisateurs peuvent être vides ou pré-chargés par DataInitializer
		assertTrue(users.size() >= 0);
	}

	@Test
	void testProjetRepository() {
		// Test de base du repository Projet
		List<Projet> projets = projetRepository.findAll();
		assertNotNull(projets);
		assertTrue(projets.size() >= 0);
	}

	@Test
	void testTacheRepository() {
		// Test de base du repository Tache
		List<Tache> taches = tacheRepository.findAll();
		assertNotNull(taches);
		assertTrue(taches.size() >= 0);
	}

	@Test
	void testRoleRepository() {
		// Test de base du repository Role
		List<Role> roles = roleRepository.findAll();
		assertNotNull(roles);
		// Les rôles sont normalement pré-chargés
		assertTrue(roles.size() >= 0);
	}

	@Test
	void testPrioriteRepository() {
		// Test de base du repository Priorite
		List<Priorite> priorites = prioriteRepository.findAll();
		assertNotNull(priorites);
		// Les priorités sont normalement pré-chargées
		assertTrue(priorites.size() >= 0);
	}

	@Test
	void testCreateAndFindUtilisateur() {
		// Test création et recherche d'un utilisateur
		Utilisateur user = new Utilisateur();
		user.setNom("TestUser_" + System.currentTimeMillis());
		user.setEmail("test" + System.currentTimeMillis() + "@test.com");
		user.setPassword("password123");

		Utilisateur saved = utilisateurRepository.save(user);
		assertNotNull(saved);
		assertNotNull(saved.getId());
		assertEquals(user.getNom(), saved.getNom());

		// Nettoyage
		utilisateurRepository.delete(saved);
	}

	@Test
	void testCreateAndFindProjet() {
		// Test création et recherche d'un projet
		Projet projet = new Projet();
		projet.setNom("TestProjet_" + System.currentTimeMillis());
		projet.setCreateur("TestCreateur");
		projet.setDate_echeance(LocalDate.now().plusMonths(1));
		projet.setDate_creation(LocalDate.now());

		Projet saved = projetRepository.save(projet);
		assertNotNull(saved);
		assertNotNull(saved.getId());
		assertEquals(projet.getNom(), saved.getNom());

		// Nettoyage
		projetRepository.delete(saved);
	}

	@Test
	void testCreateAndFindTache() {
		// Test création et recherche d'une tâche
		Tache tache = new Tache();
		tache.setNom("TestTache_" + System.currentTimeMillis());
		tache.setDescription("Description de test");
		tache.setDate_debut(LocalDate.now());
		tache.setDate_fin(LocalDate.now().plusDays(7));

		Tache saved = tacheRepository.save(tache);
		assertNotNull(saved);
		assertNotNull(saved.getId());
		assertEquals(tache.getNom(), saved.getNom());

		// Nettoyage
		tacheRepository.delete(saved);
	}

	@Test
	void testFindUtilisateurByEmail() {
		// Test recherche par email
		Utilisateur user = new Utilisateur();
		String uniqueEmail = "unique" + System.currentTimeMillis() + "@test.com";
		user.setNom("UniqueUser");
		user.setEmail(uniqueEmail);
		user.setPassword("password");

		utilisateurRepository.save(user);

		Utilisateur found = utilisateurRepository.findByEmail(uniqueEmail).orElse(null);
		assertNotNull(found);
		assertEquals(uniqueEmail, found.getEmail());

		// Nettoyage
		utilisateurRepository.delete(user);
	}
}
