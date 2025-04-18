package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.TacheRequest;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.TacheService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RequestMapping("/api/tache")
@RestController
public class TacheController {

    @Autowired
    TacheService tacheService;

    @Autowired
    ProjetService projetService;

    @Autowired
    UtilisateurService utilisateurService;

    @PostMapping("/create")
    public ResponseEntity<?> createTache(@RequestBody TacheRequest input){
        Projet projet = projetService.findByNom(input.getNom_projet());
        Utilisateur commanditaire = utilisateurService.findByNom(input.getCommanditaire());
        Utilisateur destinataire = utilisateurService.findByNom(input.getDestinataire());
        Tache existTache = tacheService.findByNom(input.getNom());

        // VERIFY NOT RENSEIGNER
        if(projet == null || commanditaire == null || existTache != null || destinataire == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Requette de Tache erronée", null));
        };

        // SET NEW TACHE
        Tache tache = new Tache();
        tache.setNom(input.getNom());
        tache.setProjet(projet);
        tache.setCommanditaire(commanditaire);
        tache.setDestinataire(destinataire);
        tache.setDescription(input.getDestinataire());
        tache.setDate_debut(new Date());
        tache.setDate_fin(input.getDate_fin());
        tacheService.create(tache);

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Tache bien créé dans un projet", tache));
    };

    @GetMapping("/tache")
    public ResponseEntity<?> getTache(@RequestBody String nom){
        Tache tache = tacheService.findByNom(nom);
        if(nom == null || tache == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Tache non trouvé, veuillez renseignez vos inputs.", null));
        };
            return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Tache bien trouvé dans un projet", tache));
    };

    @GetMapping("/{id}")
    public ResponseEntity<?> getTacheById(@RequestParam int id){
        Tache tache = tacheService.findById(id);

        if(tache == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Tache non trouvé, veuillez renseignez vos inputs.", null));
        };

        return ResponseEntity.status(HttpStatus.OK).body(new ApiResponse(true, "Tache bien trouvé dans un projet", tache));
    };

    @PatchMapping("/update")
    public ResponseEntity<?> patchTacheById(@RequestBody TacheRequest input){
        Tache existTache = tacheService.findById(input.getId());
        Tache updateTache = new Tache();

        if(existTache == null){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse(false, "Tache non reconnu ou n'existe pas", null));
        }


    };
};
