package com.visiplus.backend.dto;

import com.visiplus.backend.models.Utilisateur;

import java.util.Date;

public class TacheRequest {
    private String nom;
    private String destinataire;
    private String nom_projet;
    private String commanditaire;
    private Date date_debut;
    private Date date_fin;

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDestinataire() {
        return destinataire;
    }

    public void setDestinataire(String destinataire) {
        this.destinataire = destinataire;
    }

    public String getNom_projet() {
        return nom_projet;
    }

    public void setNom_projet(String nom_projet) {
        this.nom_projet = nom_projet;
    }

    public String getCommanditaire() {
        return commanditaire;
    }

    public void setCommanditaire(String commanditaire) {
        this.commanditaire = commanditaire;
    }

    public Date getDate_debut() {
        return date_debut;
    }

    public void setDate_debut(Date date_debut) {
        this.date_debut = date_debut;
    }

    public Date getDate_fin() {
        return date_fin;
    }

    public void setDate_fin(Date date_fin) {
        this.date_fin = date_fin;
    }
}
