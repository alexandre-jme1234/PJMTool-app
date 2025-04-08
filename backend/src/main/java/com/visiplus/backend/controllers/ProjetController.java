package com.visiplus.backend.controllers;

import com.visiplus.backend.services.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/projet")
@RestController
public class ProjetController {

    @Autowired
    ProjetService projetService;

};
