package com.visiplus.backend.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Table(name = "utilisateur")
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private String email;

    private String password;

    private String etat_connexion;

    @OneToMany(mappedBy = "proprietaire")
    private Set<Tache> tache_proprietaire;

    @OneToMany(mappedBy = "destinataire")
    private Set<Tache> taches_destinataire;


    @ManyToMany
    @JoinTable(
            name = "utilisateur_projet",
            joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "projet_id")
    )
    private Set<Projet> projets_utilisateur = new HashSet<>();

    @OneToMany(mappedBy = "createur")
    private Set<Projet> projets;

    @ManyToMany(mappedBy = "utilisateur_roles_projet")
    private Set<Role> taches_projet = new HashSet<>();

    public Set<Tache> getTache_proprietaire() {
        return tache_proprietaire;
    }

    public void setTache_proprietaire(Set<Tache> tache_proprietaire) {
        this.tache_proprietaire = tache_proprietaire;
    }

    public Set<Projet> getProjets() {
        return projets;
    }

    public void setProjets(Set<Projet> projets) {
        this.projets = projets;
    }

    public Set<Tache> getTaches_destinataire() {
        return taches_destinataire;
    }

    public void setTaches_destinataire(Set<Tache> taches_destinataire) {
        this.taches_destinataire = taches_destinataire;
    }

    public Set<Projet> getProjets_utilisateur() {
        return projets_utilisateur;
    }

    public void setProjets_utilisateur(Set<Projet> projets_utilisateur) {
        this.projets_utilisateur = projets_utilisateur;
    }


    public Set<Role> getTaches_projet() {
        return taches_projet;
    }

    public void setTaches_projet(Set<Role> taches_projet) {
        this.taches_projet = taches_projet;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEtat_connexion() {
        return etat_connexion;
    }

    public void setEtat_connexion(String etat_connexion) {
        this.etat_connexion = etat_connexion;
    }
}
