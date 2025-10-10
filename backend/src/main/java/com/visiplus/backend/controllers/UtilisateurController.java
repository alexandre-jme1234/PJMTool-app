package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.LoginRequest;
import com.visiplus.backend.dto.UtilisateurDTO;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.RoleService;
import com.visiplus.backend.services.UserRoleProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@RequestMapping("/api/utilisateur")
@RestController
public class UtilisateurController {

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    UserRoleProjetService userRoleProjetService;

    @Autowired
    RoleService roleService;

    @Autowired
    ProjetService projetService;

    @GetMapping("/")
    public List<UtilisateurDTO> findAll() {
        List<Utilisateur> utilisateurs = utilisateurService.findAll();
        return utilisateurs.stream().map(UtilisateurDTO::new).toList();
    }

    @GetMapping("/{id}")
    public Utilisateur findById(@PathVariable("id") int id) {
        return utilisateurService.findById(id);
    }

    @PostMapping("/create")
    @ResponseStatus(value= HttpStatus.ACCEPTED)
    public ResponseEntity<?> CreateUtilisateur(@RequestBody Utilisateur utilisateur) {
        if (utilisateur.getNom() == null || utilisateur.getEmail() == null) {
            return new ResponseEntity<>("Nom et email sont obligatoires", HttpStatus.BAD_REQUEST);
        }

        Role defaultRole;

        if (utilisateur.getRole_app() != null) {
            defaultRole = roleService.findByNom(utilisateur.getRole_app());
            utilisateur.setRole_app(utilisateur.getRole_app());

            if (defaultRole == null) {
                return new ResponseEntity<>("Le rôle spécifié n'existe pas", HttpStatus.BAD_REQUEST);
            }
        } else {
            defaultRole = roleService.findByNom("MEMBRE");
            utilisateur.setRole_app("MEMBRE");
            if (defaultRole == null) {
                return new ResponseEntity<>("Le rôle 'MEMBRE' est introuvable", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        return new ResponseEntity<>(utilisateurService.create(utilisateur), HttpStatus.OK);
    }

    @GetMapping("/nom")
    public Utilisateur findByNom(@RequestParam String nom){
        return utilisateurService.findByNom(nom);
    }

    @PostMapping("/add-user-to-project")
    @ResponseStatus(value= HttpStatus.ACCEPTED)
    public ResponseEntity<?> AddUtilisateurTOProject(@RequestBody Utilisateur utilisateur, @RequestParam String id) {
        Optional<Projet> projet = Optional.ofNullable(projetService.findById(Integer.parseInt(id)));
        Optional<Utilisateur> utilisateurOpt = Optional.ofNullable(utilisateurService.findByNom(utilisateur.getNom()));

        if (utilisateur.getNom() == null || projet == null) {
            return new ResponseEntity<>("Nom utilisateur ou Projet non trouvé", HttpStatus.BAD_REQUEST);
        }

        if (projet.isEmpty() || utilisateurOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Utilisateur ou projet non trouvé");
        }

        Utilisateur utilisateurPdt = utilisateurOpt.get();
        Projet projetPdt = projet.get();
        
        // Récupérer le rôle depuis le nom fourni, ou utiliser "MEMBRE" par défaut
        Role rolePdt = null;
        String roleRequested = utilisateur.getRole_app();
        
        if (roleRequested != null && !roleRequested.isEmpty()) {
            rolePdt = roleService.findByNom(roleRequested);
            
            if (rolePdt == null) {
                System.err.println("⚠️ AVERTISSEMENT: Le rôle '" + roleRequested + "' n'existe pas dans la base de données.");
                System.err.println("   Rôles valides: ADMINISTRATEUR, MEMBRE, OBSERVATEUR");
                System.err.println("   Fallback vers le rôle MEMBRE par défaut.");
            }
        }
        
        // Si le rôle n'est pas trouvé, utiliser "MEMBRE" par défaut
        if (rolePdt == null) {
            rolePdt = roleService.findByNom("MEMBRE");
        }
        
        // Vérification finale : si même "MEMBRE" n'existe pas, retourner une erreur
        if (rolePdt == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Le rôle MEMBRE n'existe pas dans la base de données", null));
        }
        
        System.out.println("✓ Rôle assigné: " + rolePdt.getNom() + " (ID: " + rolePdt.getId() + ")");

        // Créer la liaison utilisateur-projet-rôle
        UserRoleProjet urp = new UserRoleProjet();
        urp.setUtilisateur(utilisateurPdt);
        urp.setProjet(projetPdt);
        urp.setRole(rolePdt);

        // Ajout bidirectionnel
        userRoleProjetService.save(urp);
        utilisateurService.save(utilisateurPdt);
        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse<>(true, "Utilisateur Roled bien ajouté au projet", urp));
    }


    @PatchMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();
        String existPassword;

        if(email == null || password == null){
            return new ResponseEntity<>("email & password manquant", HttpStatus.BAD_REQUEST);
        }

        try {
            Utilisateur existUser = utilisateurService.findByEmail(email);
            existPassword = existUser.getPassword();

            if(existPassword.equals(password)){
                Utilisateur acceptUtilisateur = existUser;
                acceptUtilisateur.setEtat_connexion(true);
                utilisateurService.updatePartial(existUser.getId(), existUser, acceptUtilisateur);
                return new ResponseEntity<Utilisateur>(acceptUtilisateur, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(String.format("Hello %s, votre mot de passe n''es tpas bon", email), HttpStatus.UNAUTHORIZED);
            }

        } catch(Exception error) {
            return new ResponseEntity<>(error.toString(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Utilisateur utilisateur) {
        try {
            Utilisateur connecteUtilisateur = utilisateurService.findByEmail(utilisateur.getEmail());

            if(connecteUtilisateur == null){
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, "Utilisateur non trouvé", null));
            }

            if(Boolean.TRUE.equals(connecteUtilisateur.getEtat_connexion())){
                Utilisateur deconnectionUtilisateur = connecteUtilisateur;
                deconnectionUtilisateur.setEtat_connexion(false);
                utilisateurService.updatePartial(connecteUtilisateur.getId(), connecteUtilisateur, deconnectionUtilisateur);
                return ResponseEntity
                        .status(HttpStatus.OK)
                        .body(new ApiResponse<>(true, "Utilisateur bien déconnecté", deconnectionUtilisateur));
            }
                return ResponseEntity
                        .status(HttpStatus.NOT_MODIFIED)
                        .body(new ApiResponse<>(false, "Déconnexion échouée, utilisateur déjà déconnecté", connecteUtilisateur));
        } catch(Exception error) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erreur interne", error.toString()));
        }
    }
};