package com.visiplus.backend.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Table(name = "role")
@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private Boolean ajouter_membre;

    private Boolean creer_tache;

    private Boolean assigne_tache;

    private Boolean maj_tache;

    private Boolean vue_tache;

    private Boolean vue_tableau_de_bord;

    private Boolean etre_notifie;

    private Boolean vue_historique_modifications;

//    @ManyToMany(mappedBy = "roles_projet")
//    private Set<Utilisateur> utilisateur_roles_projet = new HashSet<>();

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

    public Boolean getAjouter_membre() {
        return ajouter_membre;
    }

    public void setAjouter_membre(Boolean ajouter_membre) {
        this.ajouter_membre = ajouter_membre;
    }

    public Boolean getCreer_tache() {
        return creer_tache;
    }

    public void setCreer_tache(Boolean creer_tache) {
        this.creer_tache = creer_tache;
    }

    public Boolean getAssigne_tache() {
        return assigne_tache;
    }

    public void setAssigne_tache(Boolean assigne_tache) {
        this.assigne_tache = assigne_tache;
    }

    public Boolean getMaj_tache() {
        return maj_tache;
    }

    public void setMaj_tache(Boolean maj_tache) {
        this.maj_tache = maj_tache;
    }

    public Boolean getVue_tache() {
        return vue_tache;
    }

    public void setVue_tache(Boolean vue_tache) {
        this.vue_tache = vue_tache;
    }

    public Boolean getVue_tableau_de_bord() {
        return vue_tableau_de_bord;
    }

    public void setVue_tableau_de_bord(Boolean vue_tableau_de_bord) {
        this.vue_tableau_de_bord = vue_tableau_de_bord;
    }

    public Boolean getEtre_notifie() {
        return etre_notifie;
    }

    public void setEtre_notifie(Boolean etre_notifie) {
        this.etre_notifie = etre_notifie;
    }

    public Boolean getVue_historique_modifications() {
        return vue_historique_modifications;
    }

    public void setVue_historique_modifications(Boolean vue_historique_modifications) {
        this.vue_historique_modifications = vue_historique_modifications;
    }

//    public Set<Utilisateur> getUtilisateur_roles_projet() {
//        return utilisateur_roles_projet;
//    }
//
//    public void setUtilisateur_roles_projet(Set<Utilisateur> utilisateur_roles_projet) {
//        this.utilisateur_roles_projet = utilisateur_roles_projet;
//    }
}
