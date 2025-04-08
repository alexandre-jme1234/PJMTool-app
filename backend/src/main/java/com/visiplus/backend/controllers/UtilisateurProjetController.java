package com.visiplus.backend.controllers;

import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.UtilisateurProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/api/utilisateur-projet")
@RestController
public class UtilisateurProjetController {

    @Autowired
    UtilisateurProjetService utilisateurProjetService;

};
