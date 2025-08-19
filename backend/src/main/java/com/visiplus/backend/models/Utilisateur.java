package com.visiplus.backend.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Table(name = "utilisateur")
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private String nom;

    private String role_app;

    private String email;

    private String password;

    private boolean etat_connexion;

    @OneToMany(mappedBy = "commanditaire")
    private Set<Tache> tache_commanditaire;

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
    private Set<Projet> projets = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "utilisateur_role",
            joinColumns = @JoinColumn(name = "utilisateur_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles_projet = new HashSet<>();

    public String getRole_app() {
        return role_app;
    }

    public void setRole_app(String role_app) {
        this.role_app = role_app;
    }

    public boolean isEtat_connexion() {
        return etat_connexion;
    }

    public Set<Tache> getTache_commanditaire() {
        return tache_commanditaire;
    }

    public void setTache_commanditaire(Set<Tache> tache_commanditaire) {
        this.tache_commanditaire = tache_commanditaire;
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


    public Set<Role> getRoles_projet() {
        return roles_projet;
    }

    public void setRoles_projet(Set<Role> roles_projet) {
        this.roles_projet = roles_projet;
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

    public boolean getEtat_connexion() {
        return etat_connexion;
    }

    public void setEtat_connexion(boolean etat_connexion) {
        this.etat_connexion = etat_connexion;
    }
}
