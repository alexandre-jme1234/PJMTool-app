package com.visiplus.backend.controllers;

import com.visiplus.backend.dto.TacheRequest;
import com.visiplus.backend.initializer.DataInitializer;
import com.visiplus.backend.models.Priorite;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.responses.ApiResponse;
import com.visiplus.backend.services.PrioriteService;
import com.visiplus.backend.services.ProjetService;
import com.visiplus.backend.services.TacheService;
import com.visiplus.backend.services.UtilisateurService;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;

@RequestMapping("/api/tache")
@RestController
public class TacheController {

    private static Logger logger = LoggerFactory.getLogger(TacheController.class);

    @Autowired
    TacheService tacheService;

    @Autowired
    ProjetService projetService;

    @Autowired
    UtilisateurService utilisateurService;

    @Autowired
    PrioriteService prioriteService;

    @PostMapping("/create")
    public ResponseEntity<?> createTache(@RequestBody TacheRequest input) {
        Projet projet = projetService.findById(input.getProjet_id());
        Utilisateur commanditaire = utilisateurService.findById(input.getCommanditaire_id());
        Utilisateur destinataire = utilisateurService.findById(input.getDestinataire_id());
        Tache existTache = tacheService.findByNom(input.getNom());

        // VERIFY NOT RENSEIGNER
        if (projet == null || commanditaire == null || existTache != null || destinataire == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Requette de Tache erronée ou existe deja", null));
        };

        // SET NEW TACHE
        Tache tache = new Tache();
        tache.setNom(input.getNom());
        tache.setProjet(projet);
        tache.setEtat(input.getEtat());
        tache.setCommanditaire(commanditaire);
        tache.setDestinataire(destinataire);
        tache.setDescription(input.getDescription());
        tache.setDate_debut(new Date());
        tache.setDate_fin(input.getDate_fin());

        if(input.getEtat() == null || input.getEtat().isEmpty()) {
            tache.setEtat("TODO");
        }

        if (input.getPriorite_id() != null) {
            Optional<Priorite> priorite = prioriteService.findById((Integer) input.getPriorite_id());
            if (priorite != null) {
                tache.setPriorite(priorite.get());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(false, "Priorité inconnue", null));
            }
        }
        tacheService.create(tache);

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(true, "Tache bien créé dans un projet", tache));
    };

    @GetMapping("/tache")
    public ResponseEntity<?> getTache(@RequestParam String nom) {
        Tache tache = tacheService.findByNom(nom);
        if (nom == null || tache == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Tache non trouvé, veuillez renseignez vos inputs.", null));
        }
        ;
        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(true, "Tache bien trouvé dans un projet", tache));
    };

    @GetMapping("/{id}")
    public ResponseEntity<?> getTacheById(@RequestParam int id) {
        Optional<Tache> tache = tacheService.findById(id);

        if (tache == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Tache non trouvé, veuillez renseignez vos inputs.", null));
        }
        ;

        return ResponseEntity.status(HttpStatus.OK)
                .body(new ApiResponse(true, "Tache bien trouvé dans un projet", tache));
    };

    @GetMapping("/project/{id}")
    public ResponseEntity<?> getTachesByProjectId(@PathVariable int id) {
        List<Tache> taches = tacheService.findByProjetId(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tâches du projet", taches));
    }

    @PatchMapping("/update")
    public ResponseEntity<?> patchTacheById(@RequestBody TacheRequest input) {
        Optional<Tache> existTacheOpt = tacheService.findById(input.getId());

        
        Tache updateTache = new Tache();
        if (existTacheOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse(false, "Tache non reconnu ou n'existe pas", null));
        }

        Tache existTache = existTacheOpt.get();
        try {
            if (input.getCommanditaire_id() != null) {
                Utilisateur commanditaire = utilisateurService.findById(input.getCommanditaire_id());
                existTache.setCommanditaire(commanditaire);
            }

            if (input.getDestinataire_id() != null) {
                Utilisateur destinataire = utilisateurService.findById(input.getDestinataire_id());
                existTache.setDestinataire(destinataire);
            }

            if (input.getProjet_id() != null) {
                Projet projet = projetService.findById(input.getProjet_id());
                existTache.setProjet(projet);
            }

            if (input.getNom() != null) {
                existTache.setNom(input.getNom());
            }

            if (input.getDate_debut() != null) {
                existTache.setDate_debut(input.getDate_debut());
            }

            if (input.getDate_fin() != null) {
                existTache.setDate_fin(input.getDate_fin());
            }

            if (input.getEtat() != null) {
                existTache.setEtat(input.getEtat());
            }

            if (input.getDescription() != null) {
                existTache.setDescription(input.getDescription());
            }

            if (input.getPriorite_id() != null) {

                Priorite priorite;

                if (input.getPriorite_id() instanceof Integer) {
                    Integer priorite_id = input.getPriorite_id();
                    Optional<Priorite> priorite_exist = prioriteService.findById(priorite_id);
                    existTache.setPriorite(priorite_exist.get());
                } else {
                    Optional<Priorite> priorite_exist = prioriteService.findById(102);
                    existTache.setPriorite(priorite_exist.get());
                }

            }

            Tache updatedTache = tacheService.save(existTache);
            return ResponseEntity.status(HttpStatus.OK)
                    .body(new ApiResponse<>(true, "Tache bien mise à jour", updatedTache));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "Erreur lors de la mise à jour", e.getMessage()));
        }
    };

    @PutMapping("/update")
    public ResponseEntity<?> updateTacheById(@RequestBody TacheRequest input) {
        return patchTacheById(input);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteTacheById(@PathVariable int id ){
        Optional<Tache> tache = tacheService.findById(id);
        
        if(tache.isEmpty()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(false, "Tache n'existe pas", null));
        }
        
        boolean deleted = tacheService.deleteByID(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(new ApiResponse<>(true, "Tache a été trouvé", deleted));
    }
};