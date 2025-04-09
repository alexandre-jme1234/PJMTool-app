package com.visiplus.backend.models;

import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

@Table(name = "role")
@Entity
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String[] roles = {"ADMINISTRATEUR", "MEMBRE", "OBSERVATEUR"};

    private boolean ajouter_membre;

    private boolean creer_tache;

    private boolean assigne_tache;

    private boolean maj_tache;

    private boolean vue_tache;

    private boolean vue_tableau_de_bord;

    private boolean etre_notifie;

    private boolean vue_historique_modifications;

    @ManyToMany
    @JoinTable(
            name = "utilisateur_role",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "utilisateur_id")
    )
    private Set<Utilisateur> utilisateur_roles_projet = new HashSet<>();


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String[] getRoles() {
        return roles;
    }

    public void setRoles(String[] roles) {
        this.roles = roles;
    }

    public boolean isAjouter_membre() {
        return ajouter_membre;
    }

    public void setAjouter_membre(boolean ajouter_membre) {
        this.ajouter_membre = ajouter_membre;
    }

    public boolean isCreer_tache() {
        return creer_tache;
    }

    public void setCreer_tache(boolean creer_tache) {
        this.creer_tache = creer_tache;
    }

    public boolean isAssigne_tache() {
        return assigne_tache;
    }

    public void setAssigne_tache(boolean assigne_tache) {
        this.assigne_tache = assigne_tache;
    }

    public boolean isMaj_tache() {
        return maj_tache;
    }

    public void setMaj_tache(boolean maj_tache) {
        this.maj_tache = maj_tache;
    }

    public boolean isVue_tache() {
        return vue_tache;
    }

    public void setVue_tache(boolean vue_tache) {
        this.vue_tache = vue_tache;
    }

    public boolean isVue_tableau_de_bord() {
        return vue_tableau_de_bord;
    }

    public void setVue_tableau_de_bord(boolean vue_tableau_de_bord) {
        this.vue_tableau_de_bord = vue_tableau_de_bord;
    }

    public boolean isEtre_notifie() {
        return etre_notifie;
    }

    public void setEtre_notifie(boolean etre_notifie) {
        this.etre_notifie = etre_notifie;
    }

    public boolean isVue_historique_modifications() {
        return vue_historique_modifications;
    }

    public void setVue_historique_modifications(boolean vue_historique_modifications) {
        this.vue_historique_modifications = vue_historique_modifications;
    }

    public Set<Utilisateur> getUtilisateur_roles_projet() {
        return utilisateur_roles_projet;
    }

    public void setUtilisateur_roles_projet(Set<Utilisateur> utilisateur_roles_projet) {
        this.utilisateur_roles_projet = utilisateur_roles_projet;
    }
}
