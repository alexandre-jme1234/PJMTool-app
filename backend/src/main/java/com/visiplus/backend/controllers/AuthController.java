package com.visiplus.backend.controllers;


import com.visiplus.backend.models.Utilisateur;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/login")
public class AuthController {



    @PostMapping("/login")
    public void login(@RequestBody Utilisateur loginRequest) {
        // Déléguer la logique de connexion au service
        System.out.println(loginRequest);
    }
}
