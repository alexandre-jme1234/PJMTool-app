package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.LoginRequest;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.RoleService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RequestMapping("/api/utilisateur")
@RestController
public class UtilisateurController {

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    RoleService roleService;

    @GetMapping("/")
    public List<Utilisateur> findAll() {
        return utilisateurService.findAll();
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

        Set<Role> roles = new HashSet<>();
        roles.add(defaultRole);
        utilisateur.setRoles_projet(roles);

        return new ResponseEntity<>(utilisateurService.create(utilisateur), HttpStatus.OK);
    }

    @GetMapping("/nom")
    public Utilisateur findByNom(@RequestParam String nom){
        return utilisateurService.findByNom(nom);
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
                Utilisateur deconnectionUtilisateur = new Utilisateur();
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
