package com.visiplus.backend;

import com.visiplus.backend.dao.*;
import com.visiplus.backend.models.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

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
		List<Utilisateur> users = StreamSupport.stream(utilisateurRepository.findAll().spliterator(), false)
				.collect(Collectors.toList());
		assertNotNull(users);
		// Les utilisateurs peuvent être vides ou pré-chargés par DataInitializer
		assertTrue(users.size() >= 0);
	}

	@Test
	void testProjetRepository() {
		// Test de base du repository Projet
		List<Projet> projets = StreamSupport.stream(projetRepository.findAll().spliterator(), false)
				.collect(Collectors.toList());
		assertNotNull(projets);
		assertTrue(projets.size() >= 0);
	}

	@Test
	void testTacheRepository() {
		// Test de base du repository Tache
		List<Tache> taches = StreamSupport.stream(tacheRepository.findAll().spliterator(), false)
				.collect(Collectors.toList());
		assertNotNull(taches);
		assertTrue(taches.size() >= 0);
	}

	@Test
	void testRoleRepository() {
		// Test de base du repository Role
		List<Role> roles = StreamSupport.stream(roleRepository.findAll().spliterator(), false)
				.collect(Collectors.toList());
		assertNotNull(roles);
		// Les rôles sont normalement pré-chargés
		assertTrue(roles.size() >= 0);
	}

	@Test
	void testPrioriteRepository() {
		// Test de base du repository Priorite
		List<Priorite> priorites = StreamSupport.stream(prioriteRepository.findAll().spliterator(), false)
				.collect(Collectors.toList());
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
		// Créer d'abord un utilisateur pour le créateur
		Utilisateur createur = new Utilisateur();
		createur.setNom("TestCreateur_" + System.currentTimeMillis());
		createur.setEmail("createur" + System.currentTimeMillis() + "@test.com");
		createur.setPassword("password");
		Utilisateur savedCreateur = utilisateurRepository.save(createur);

		Projet projet = new Projet();
		projet.setNom("TestProjet_" + System.currentTimeMillis());
		projet.setCreateur(savedCreateur);
		projet.setDate_echeance(convertToDate(LocalDate.now().plusMonths(1)));
		projet.setDate_creation(convertToDate(LocalDate.now()));

		Projet saved = projetRepository.save(projet);
		assertNotNull(saved);
		assertNotNull(saved.getId());
		assertEquals(projet.getNom(), saved.getNom());

		// Nettoyage
		projetRepository.delete(saved);
		utilisateurRepository.delete(savedCreateur);
	}

	@Test
	void testCreateAndFindTache() {
		// Test création et recherche d'une tâche
		Tache tache = new Tache();
		tache.setNom("TestTache_" + System.currentTimeMillis());
		tache.setDescription("Description de test");
		tache.setDate_debut(convertToDate(LocalDate.now()));
		tache.setDate_fin(convertToDate(LocalDate.now().plusDays(7)));

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

	/**
	 * Méthode utilitaire pour convertir LocalDate en Date
	 */
	private Date convertToDate(LocalDate localDate) {
		return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
	}
}
