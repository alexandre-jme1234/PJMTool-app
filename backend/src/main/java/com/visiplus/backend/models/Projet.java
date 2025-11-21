package com.visiplus.backend.models;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Table(name = "projet")
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private String description;

    @Temporal(value = TemporalType.DATE)
    private Date date_echeance;

    @Temporal(value = TemporalType.DATE)
    private Date date_creation;

    @OneToMany(mappedBy = "projet", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<UserRoleProjet> utilisateursRoles = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "projet_tache",
            joinColumns = @JoinColumn(name = "projet_id"),
            inverseJoinColumns = @JoinColumn(name = "tache_id")
    )
    private Set<Tache> projet_taches = new HashSet<>();

    @OneToMany(mappedBy = "projet")
    private Set<Tache> taches;

    @ManyToOne
    @JoinColumn(name = "createur_id", referencedColumnName = "id")
    @JsonIdentityInfo(
            generator = ObjectIdGenerators.PropertyGenerator.class,
            property = "id"
    )
    private Utilisateur createur;

    public Set<Tache> getProjet_taches() {
        return projet_taches;
    }

    public void setDate_creation(Date date_creation) {
        this.date_creation = date_creation;
    }

    @PrePersist
    protected void onCreate() {
        this.date_creation = new Date();
    }

    @PreRemove
    protected void onRemove() {
        // Nettoyer explicitement les relations avant suppression
        if (utilisateursRoles != null) {
            utilisateursRoles.clear();
        }
    }

    public Date getDate_creation() {
        return date_creation;
    }
    
    public void setProjet_taches(Set<Tache> projet_taches) {
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
        this.date_echeance = date_echeance;}

    public Set<UserRoleProjet> getUtilisateursRoles() {
        return utilisateursRoles;
    }

    public void setUtilisateursRoles(Set<UserRoleProjet> utilisateursRoles) {
        this.utilisateursRoles = utilisateursRoles;
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
