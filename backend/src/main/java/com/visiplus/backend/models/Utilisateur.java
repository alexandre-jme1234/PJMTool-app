package com.visiplus.backend.models;

import jakarta.persistence.*;

import java.util.Set;

@Table(name = "Utilisateur")
@Entity
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;

    private String nom;

    private String email;

    private String password;

    private String etat_connexion;

    private String role;

    private String description;

    private String img_profil;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "tache_proprietaire_id", referencedColumnName = "id")
    private Tache tache_proprietaire;

    @OneToMany(mappedBy = "destinataire")
    private Set<Tache> taches_destinataire;

    @OneToMany(mappedBy = "createur")
    private Set<Projet> projets;

    @Version
    private Integer version;

    public Tache getTache_proprietaire() {
        return tache_proprietaire;
    }

    public void setTache_proprietaire(Tache tache_proprietaire) {
        this.tache_proprietaire = tache_proprietaire;
    }


    public Integer getVersion() {
        return version;
    }

    public Set<Tache> getTaches_destinataire() {
        return taches_destinataire;
    }

    public void setTaches_destinataire(Set<Tache> taches_destinataire) {
        this.taches_destinataire = taches_destinataire;
    }

    public void setVersion(Integer version) {
        this.version = version;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImg_profil() {
        return img_profil;
    }

    public void setImg_profil(String img_profil) {
        this.img_profil = img_profil;
    }
}
