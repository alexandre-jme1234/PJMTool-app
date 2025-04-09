package com.visiplus.backend.controllers;

import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/api/utilisateur")
@RestController
public class UtilisateurController {

    @Autowired
    UtilisateurService utilisateurService;

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
    public int CreateUtilisateur(@RequestBody Utilisateur utilisateur){
        return utilisateurService.create(utilisateur);
    };

    @GetMapping("/{name}")
    public Utilisateur findByNom(@PathVariable("name") String nom){
        return utilisateurService.findByNom(nom);
    }
};
