package com.visiplus.backend.models;


import jakarta.persistence.*;

import java.sql.Date;
import java.util.HashSet;
import java.util.Set;

@Table(name = "projet")
@Entity
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private String description;

    @Temporal(value = TemporalType.DATE)
    private Date date_echeance;

    @ManyToMany(mappedBy = "projets_utilisateur")
    private Set<Utilisateur> utilisateurs_projet = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "projet_tache",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "tache_id")
    )
    private HashSet<Tache> projet_taches = new HashSet<>();

    @OneToMany(mappedBy = "projet")
    private Set<Tache> taches;

    @ManyToOne
    @JoinColumn(name = "createur_id", referencedColumnName = "id")
    private Utilisateur createur;

    public HashSet<Tache> getProjet_taches() {
        return projet_taches;
    }

    public void setProjet_taches(HashSet<Tache> projet_taches) {
        this.projet_taches = projet_taches;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getDate_echeance() {
        return date_echeance;
    }

    public void setDate_echeance(Date date_echeance) {
        this.date_echeance = date_echeance;
    }

    public Set<Utilisateur> getUtilisateurs_projet() {
        return utilisateurs_projet;
    }

    public void setUtilisateurs_projet(Set<Utilisateur> utilisateurs_projet) {
        this.utilisateurs_projet = utilisateurs_projet;
    }

    public Set<Tache> getTaches() {
        return taches;
    }

    public void setTaches(Set<Tache> taches) {
        this.taches = taches;
    }

    public Utilisateur getCreateur() {
        return createur;
    }

    public void setCreateur(Utilisateur createur) {
        this.createur = createur;
    }
};
