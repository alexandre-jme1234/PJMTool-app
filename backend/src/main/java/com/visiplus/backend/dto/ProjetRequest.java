package com.visiplus.backend.dto;

import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Utilisateur;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.Date;

public class ProjetRequest {

    private String nom;

    private String description;

    private String createur;

    private Date date_echeance;

    private String email_user;

    private RoleProject role_projet;

    public enum RoleProject {
        ADMINISTRATEUR,
        MEMBRE,
        OBSERVATEUR
    }

    public RoleProject getRole_projet() {
        return role_projet;
    }

    public void setRole_projet(RoleProject role_projet) {
        this.role_projet = role_projet;
    }

    public String getEmail_user() {
        return email_user;
    }

    public void setEmail_user(String email_user) {
        this.email_user = email_user;
    }

    public Date getDate_echeance() {
        return date_echeance;
    }

    public void setDate_echeance(Date date_echeance) {
        this.date_echeance = date_echeance;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCreateur() {
        return createur;
    }

    public void setCreateur(String createur) {
        this.createur = createur;
    }
}
