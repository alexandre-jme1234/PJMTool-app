package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.*;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.RoleService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RequestMapping("/api/projet")
@RestController
public class ProjetController {

    @Autowired
    ProjetService  projetService;

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    RoleService roleService;


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

    @PostMapping("/create")
    public ResponseEntity<?> createProject(@RequestBody UtilisateurProjetRoleDTO utilisateurProjetRoleDTO ){
        Utilisateur userProject = utilisateurService.findByNom(utilisateurProjetRoleDTO.getUtilisateur().getNom());
        Projet projetProject = projetService.findByNom(utilisateurProjetRoleDTO.getProjetRequest().getNom());
        Role roleUserProject = roleService.findByNom(utilisateurProjetRoleDTO.getRole().getNom());
        Role adminRole = roleService.findByNom("ADMINISTRATEUR");

        Projet projectDTO = new Projet();

        if(userProject == null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Utilisateur n'est pas connu ou l id n'est pas le bon", null));
        }

        if(userProject.getEtat_connexion() == false){return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Utilisateur n'est pas identifié", null));

        }

        if(projetProject != null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Le projet existe déjà", projetProject));
        }

        if(projetProject.getDate_echeance() == null){
            projectDTO.setDate_echeance(null);
        }

        if(roleUserProject != null) {
            adminRole = roleUserProject;
        }

        UtilisateurProjetRoleDTO utilisateurProjetRoleDTO1 = new UtilisateurProjetRoleDTO(
                userProject,
                adminRole,
                projectDTO
        );

        UtilisateurProjetRoleDTO response = new UtilisateurProjetRoleDTO(
                utilisateurProjetRoleDTO1.getUtilisateur(),
                utilisateurProjetRoleDTO1.getRole(),
                utilisateurProjetRoleDTO1.getProjetRequest()
        );


        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Un projet a été créé", response));
    };

//    @PostMapping("/add-user")
//    public ResponseEntity<?> addUserToProject(@RequestBody ProjetRequest projetRequest){
//        Projet projet = projetService.findByNom(projetRequest.getNom());
//        Utilisateur utilisateur = utilisateurService.findByEmail(projetRequest.getEmail_user());
//
//        if(projetRequest.getNom() == null || projetRequest.getEmail_user() == null) {
//            return ResponseEntity
//                    .status(HttpStatus.BAD_REQUEST)
//                    .body(new ApiResponse<>(false, "Veuillez renseignez un nom de projet valide et un mail invité.", null));
//        };
//
//        if(projet == null || utilisateur == null){
//            return ResponseEntity
//                    .status(HttpStatus.BAD_REQUEST)
//                    .body(new ApiResponse<>(false, "Projet ou adresse introuvable", null));
//        };
//
//        String nomRole = projetRequest.getRole_projet() != null
//                ? projetRequest.getRole_projet().name()
//                : "OBSERVATEUR";
//
//        Role role = roleService.findByNom(nomRole);
//        if(role == null){
//            roleService.findByNom("OBSERVATEUR");
//        }
//
//        if (!projet.getUtilisateurs_projet().contains(utilisateur)) {
//            projet.getUtilisateurs_projet().add(utilisateur);
//            utilisateur.getProjets_utilisateur().add(projet);
//
//            // PAR DEFAUT USER EST OBSERVATEUR
//            utilisateur.getRoles_projet().add(role);
//
//            projetService.create(projet);
//            utilisateurService.create(utilisateur);
//        }
//
//        UtilisateurProjetRoleDTO responseData = new UtilisateurProjetRoleDTO(utilisateur, role);
//
//        /* List<UtilisateurProjetDTO> utilisateurProjet = utilisateur.getProjets_utilisateur()
//                .stream()
//                .map(current_projet -> new UtilisateurProjetDTO(utilisateur.getId(), projet.getId()))
//                .collect(Collectors.toList());
//
//        ProjetResponseDTO response = new ProjetResponseDTO(projet, null, utilisateurProjet);
//         */
//
//        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Un projet a été créé", responseData));
//    };

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable int id){
        Projet projet = projetService.findById(id);

        if(projet == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Projet n'existe pas", null));
        }

        projetService.delete(projet);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Projet a été supprimé", null));
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
