package com.visiplus.backend.dto;

import com.visiplus.backend.models.Utilisateur;

public class UtilisateurLightDTO {
    private int id;
    private String nom;
    private String email;
    private String role_app;
    private boolean etat_connexion;

    public UtilisateurLightDTO(Utilisateur utilisateur) {
        this.id = utilisateur.getId();
        this.nom = utilisateur.getNom();
        this.email = utilisateur.getEmail();
        this.role_app = utilisateur.getRole_app();
        this.etat_connexion = utilisateur.getEtat_connexion();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole_app() {
        return role_app;
    }

    public void setRole_app(String role_app) {
        this.role_app = role_app;
    }

    public boolean isEtat_connexion() {
        return etat_connexion;
    }

    public void setEtat_connexion(boolean etat_connexion) {
        this.etat_connexion = etat_connexion;
    }
}
