package com.visiplus.backend.models;


import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Objects;

@Entity
@IdClass(UtilisateurProjet.PK.class)
public class UtilisateurProjet {

    @Id
    @ManyToOne
    @JoinColumn(name = "utilisateur_id", referencedColumnName = "id")
    private Utilisateur utilisateur;

    @Id
    @ManyToOne
    @JoinColumn(name = "tache_id", referencedColumnName = "id")
    private Tache tache;

    @Id
    @ManyToOne
    @JoinColumn(name = "projet_id", referencedColumnName = "id")
    private Projet projet;

    public static class PK implements Serializable
    {
        Long utilisateur;
        Long tache;
        Long projet;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Tache getTache() {
        return tache;
    }

    public void setTache(Tache tache) {
        this.tache = tache;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        UtilisateurProjet that = (UtilisateurProjet) o;
        return Objects.equals(utilisateur, that.utilisateur) && Objects.equals(tache, that.tache) && Objects.equals(projet, that.projet);
    }

    @Override
    public int hashCode() {
        return Objects.hash(utilisateur, tache, projet);
    }
}
