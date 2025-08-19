package com.visiplus.backend.dto;

import com.visiplus.backend.models.Priorite;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Utilisateur;

import java.util.Date;

public class TacheRequest {
    private int id;
    private String nom;
    private Integer destinataire_id;
    private Integer projet_id;
    private Integer commanditaire_id;
    private Date date_debut;
    private Date date_fin;
    private Integer priorite_id;
    private String description;
    private String etat;

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Integer getDestinataire_id() {
        return destinataire_id;
    }

    public void setDestinataire_id(Integer destinataire_id) {
        this.destinataire_id = destinataire_id;
    }

    public Integer getProjet_id() {
        return projet_id;
    }

    public void setProjet_id(Integer projet_id) {
        this.projet_id = projet_id;
    }

    public Integer getCommanditaire_id() {
        return commanditaire_id;
    }

    public void setCommanditaire_id(Integer commanditaire_id) {
        this.commanditaire_id = commanditaire_id;
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

    public Integer getPriorite_id() {
        return priorite_id;
    }

    public void setPriorite_id(Integer priorite_id) {
        this.priorite_id = priorite_id;
    }

    public String getEtat() {
        return etat;
    }

    public void setEtat(String etat) {
        this.etat = etat;
    }

    @Override
    public String toString() {
        return "TacheRequest{" +
                "nom='" + nom + '\'' +
                ", destinataire_id='" + destinataire_id + '\'' +
                ", projet_id='" + projet_id + '\'' +
                ", commanditaire_id='" + commanditaire_id + '\'' +
                ", date_debut='" + date_debut + '\'' +
                ", date_fin='" + date_fin + '\'' +
                ", priorite='" + priorite_id + '\'' +
                ", description='" + description + '\'' +
                ", etat='" + etat + '\'' +
                '}';
    }
}
