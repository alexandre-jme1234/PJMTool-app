package com.visiplus.backend.controllers;

import com.visiplus.backend.services.TacheService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/tache")
@RestController
public class TacheController {

    @Autowired
    TacheService tacheService;

};
