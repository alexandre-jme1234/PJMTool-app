package com.visiplus.backend.dto;

import com.visiplus.backend.models.Utilisateur;

public class UtilisateurDTO {

    private int id;
    private String nom;
    private String email;
    private String role_app;
    private boolean etat_connexion;

    public UtilisateurDTO(Utilisateur u) {
        this.id = u.getId();
        this.nom = u.getNom();
        this.email = u.getEmail();
        this.role_app = u.getRole_app();
        this.etat_connexion = u.getEtat_connexion();
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
