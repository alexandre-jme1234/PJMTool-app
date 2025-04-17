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

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequestMapping("/api/projet")
@RestController
public class ProjetController {

    @Autowired
    ProjetService projetService;

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    RoleService roleService;

    @GetMapping("/{nom}")
    public ResponseEntity<?> getProjectById(@PathVariable String nom){
        Projet projet = projetService.findByNom(nom);

        if(projet == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Projet n'existe pas", null));
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, "Projet a été trouvé", projet));
    }

    @PostMapping("/create")
    public ResponseEntity<?> createProject(@RequestBody ProjetRequest projetRequest){
        Utilisateur utilisateurByNom = utilisateurService.findByNom(projetRequest.getCreateur());
        Projet existProjet = projetService.findByNom(projetRequest.getNom());
        Role administrateurRole = roleService.findByNom("ADMINISTRATEUR");

        Projet projet = new Projet();

        if(utilisateurByNom == null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Utilisateur n'est pas connu ou l id n'est pas le bon", null));
        }

        if(utilisateurByNom.getEtat_connexion() == false){return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, "Utilisateur n'est pas identifié", null));

        }

        if(existProjet != null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Le projet existe déjà", existProjet));
        }

        if(projetRequest.getDate_echeance() == null){
            projet.setDate_echeance(null);
        }

        // SET ADMIN ROLE
        Set<Role> roles = new HashSet<>();
        roles.add(administrateurRole);

        projet.setDate_echeance(projetRequest.getDate_echeance());
        utilisateurByNom.setRoles_projet(roles);
        projet.setCreateur(utilisateurByNom);
        projet.setNom(projetRequest.getNom());
        projet.setDescription(projetRequest.getDescription());
        projet.setDate_creation(new Date());
        projetService.create(projet);

        List<UtilisateurRoleDTO> utilisateurRoles = utilisateurByNom.getRoles_projet()
                .stream()
                .map(role -> new UtilisateurRoleDTO(utilisateurByNom.getId(), role.getId()))
                .collect(Collectors.toList());

        ProjetResponseDTO response = new ProjetResponseDTO(projet, utilisateurRoles, null);

      return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Un projet a été créé", response));
    };

    @PostMapping("/add-user")
    public ResponseEntity<?> addUserToProject(@RequestBody ProjetRequest projetRequest){
        Projet projet = projetService.findByNom(projetRequest.getNom());
        Utilisateur utilisateur = utilisateurService.findByEmail(projetRequest.getEmail_user());

        if(projetRequest.getNom() == null || projetRequest.getEmail_user() == null) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Veuillez renseignez un nom de projet valide et un mail invité.", null));
        };

        if(projet == null || utilisateur == null){
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(false, "Projet ou adresse introuvable", null));
        };

        String nomRole = projetRequest.getRole_projet() != null
                ? projetRequest.getRole_projet().name()
                : "OBSERVATEUR";

        Role role = roleService.findByNom(nomRole);
        if(role == null){
            roleService.findByNom("OBSERVATEUR");
        }

        if (!projet.getUtilisateurs_projet().contains(utilisateur)) {
            projet.getUtilisateurs_projet().add(utilisateur);
            utilisateur.getProjets_utilisateur().add(projet);

            // PAR DEFAUT USER EST OBSERVATEUR
            utilisateur.getRoles_projet().add(role);

            projetService.create(projet);
            utilisateurService.create(utilisateur);
        }

        UtilisateurProjetRoleDTO responseData = new UtilisateurProjetRoleDTO(utilisateur, role);

        /* List<UtilisateurProjetDTO> utilisateurProjet = utilisateur.getProjets_utilisateur()
                .stream()
                .map(current_projet -> new UtilisateurProjetDTO(utilisateur.getId(), projet.getId()))
                .collect(Collectors.toList());

        ProjetResponseDTO response = new ProjetResponseDTO(projet, null, utilisateurProjet);
         */

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Un projet a été créé", responseData));
    };
};
