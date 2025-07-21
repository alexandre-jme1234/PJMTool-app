package com.visiplus.backend.models;


import jakarta.persistence.*;

import java.util.Date;

@Table(name = "tache")
@Entity
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private String est_termine = "TODO";

    @ManyToOne
    @JoinColumn(name = "commanditaire_id", referencedColumnName = "id")
    private Utilisateur commanditaire;

    @ManyToOne
    @JoinColumn(name = "destinataire_id", referencedColumnName = "id")
    private Utilisateur destinataire;

    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date_debut;

    @Temporal(TemporalType.TIMESTAMP)
    private Date date_fin;

    @ManyToOne
    @JoinColumn(name="projet_id", referencedColumnName = "id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "priorite_id", referencedColumnName = "id")
    private Priorite priorite;

    public Priorite getPriorite() {
        return priorite;
    }

    public void setPriorite(Priorite priorite) {
        this.priorite = priorite;
    }

    public String isEst_termine() {
        return est_termine;
    }

    public void setEst_termine(String est_termine) {
        this.est_termine = est_termine;
    }

    public Utilisateur getDestinataire() {
        return destinataire;
    }

    public void setDestinataire(Utilisateur destinataire) {
        this.destinataire = destinataire;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
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

    public Utilisateur getCommanditaire() {
        return commanditaire;
    }

    public void setCommanditaire(Utilisateur commanditaire) {
        this.commanditaire = commanditaire;
    }

    public String getDescription() {
        return description;
    } 

    public void setDescription(String description) {
        this.description = description;
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
