package com.visiplus.backend.models;


import jakarta.persistence.*;

import java.sql.Date;
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

    private boolean permission_admin;

    private boolean permission_observateur;

    private boolean permission_membre;

    @OneToMany(mappedBy = "projet")
    private Set<Tache> taches;

    @ManyToOne
    @JoinColumn(name = "createur_id", referencedColumnName = "id")
    private Utilisateur createur;

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

    public boolean isPermission_admin() {
        return permission_admin;
    }

    public void setPermission_admin(boolean permission_admin) {
        this.permission_admin = permission_admin;
    }

    public boolean isPermission_observateur() {
        return permission_observateur;
    }

    public void setPermission_observateur(boolean permission_observateur) {
        this.permission_observateur = permission_observateur;
    }

    public boolean isPermission_membre() {
        return permission_membre;
    }

    public void setPermission_membre(boolean permission_membre) {
        this.permission_membre = permission_membre;
    }

    public Set<Tache> getTaches() {
        return taches;
    }

    public void setTaches(Set<Tache> taches) {
        this.taches = taches;
    }
};
