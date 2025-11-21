package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.*;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.RoleService;
import com.visiplus.backend.services.UserRoleProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/api/projet")
@RestController
public class ProjetController {

    private static final Logger logger = LoggerFactory.getLogger(ProjetController.class);

    @Autowired
    ProjetService  projetService;

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    RoleService roleService;

    @Autowired
    UserRoleProjetService userRoleProjetService;

    @Autowired
    com.visiplus.backend.services.TacheService tacheService;


    @GetMapping("/nom/{nom}")
    public ResponseEntity<?> getProjectByNom(@PathVariable String nom ){
        Projet projet = projetService.findByNom(nom);

        if(projet == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Projet n'existe pas", null));
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, "Projet a été trouvé", projet));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<?> getProjectById(@PathVariable int id ){
        Projet projet = projetService.findById(id);

        if(projet == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Projet n'existe pas", null));
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, "Projet a été trouvé", projet));
    }

    @GetMapping("/users-roled/{id}")
    public ResponseEntity<?> getUsersRoledByProject(@PathVariable int id) {
        List<UserRoleProjet> projets = userRoleProjetService.findALl();

        if(projets.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Aucun Projet trouvé", null));
        }

        List<UserRoleProjet> filteredProjets = projets.stream()
                .filter(p -> p.getProjet().getId() == id)
                .collect(Collectors.toList());


        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, "User Roled Projet Trouvé", filteredProjets));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProject(@RequestBody ProjetRequest projetRequest ){
        // Récupération de l'utilisateur par son nom (createur)
        Utilisateur userProject = utilisateurService.findByNom(projetRequest.getCreateur());
        
        // Vérification si le projet existe déjà
        Projet projetExistant = projetService.findByNom(projetRequest.getNom());
        
        // Récupération du rôle (par défaut ADMINISTRATEUR)
        Role adminRole = roleService.findByNom("ADMINISTRATEUR");

        // Validation : utilisateur existe
        if(userProject == null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Utilisateur n'est pas connu ou le nom n'est pas le bon", null));
        }

        // Validation : utilisateur connecté
        if(userProject.getEtat_connexion() == false){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Utilisateur n'est pas identifié", null));
        }

        // Validation : projet n'existe pas déjà
        if(projetExistant != null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Le projet existe déjà", projetExistant));
        }

        // Création du nouveau projet
        Projet nouveauProjet = new Projet();
        nouveauProjet.setNom(projetRequest.getNom());
        nouveauProjet.setDescription(projetRequest.getDescription());
        nouveauProjet.setDate_echeance(projetRequest.getDate_echeance());
        nouveauProjet.setCreateur(userProject);
        
        // Sauvegarde du projet et récupération de l'ID
        int projetId = projetService.create(nouveauProjet);
        
        // Récupération du projet créé
        Projet projetCree = projetService.findById(projetId);

        // Création de la relation UserRoleProjet
        UserRoleProjet userRoleProjet = new UserRoleProjet();
        userRoleProjet.setUtilisateur(userProject);
        userRoleProjet.setProjet(projetCree);
        userRoleProjet.setRole(adminRole);
        userRoleProjetService.save(userRoleProjet);

        // Préparation de la réponse
        UtilisateurProjetRoleDTO response = new UtilisateurProjetRoleDTO(
                userProject,
                adminRole,
                projetCree
        );

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Un projet a été créé", response));
    };

    @DeleteMapping("/delete/{id}")
    @Transactional
    public ResponseEntity<?> deleteProject(@PathVariable int id){
        Projet projet = projetService.findById(id);

        if(projet == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Projet n'existe pas", null));
        }

        try {
            logger.info("[DELETE] Début de la suppression du projet ID: {}", id);
            
            // 1. Supprimer les entrées de la table de jointure projet_tache
            logger.info("[DELETE] Étape 1: Suppression des relations projet_tache");
            projetService.deleteProjetTacheRelations(id);
            logger.info("[DELETE] Étape 1: OK");

            // 2. Supprimer toutes les tâches associées au projet
            logger.info("[DELETE] Étape 2: Suppression des tâches");
            List<com.visiplus.backend.models.Tache> taches = tacheService.findByProjetId(id);
            logger.info("[DELETE] Nombre de tâches à supprimer: {}", taches.size());
            for(com.visiplus.backend.models.Tache tache : taches) {
                tacheService.deleteByID(tache.getId());
            }
            logger.info("[DELETE] Étape 2: OK");

            // 3. Supprimer toutes les relations UserRoleProjet (requête SQL native)
            logger.info("[DELETE] Étape 3: Suppression des relations UserRoleProjet");
            userRoleProjetService.deleteByProjetId(id);
            logger.info("[DELETE] Étape 3: OK");

            // 4. Enfin supprimer le projet
            logger.info("[DELETE] Étape 4: Suppression du projet");
            projetService.delete(projet);
            logger.info("[DELETE] Étape 4: OK");
            
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse<>(true, "Projet, ses tâches et ses relations ont été supprimés", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erreur lors de la suppression: " + e.getMessage(), null));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllProjects(){
        List<Projet> projects = projetService.findAll();
        List<ProjetResponseDTO> dtos = projects.stream()
            .map(p -> new ProjetResponseDTO(
                p.getId(),
                p.getNom(),
                p.getDescription(),
                p.getDate_echeance(),
                p.getDate_creation()
            ))
            .collect(Collectors.toList());
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Liste des projets", dtos));
    }


};
