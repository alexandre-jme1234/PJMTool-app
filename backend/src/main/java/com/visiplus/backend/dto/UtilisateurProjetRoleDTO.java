package com.visiplus.backend.dto;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.Utilisateur;

public class UtilisateurProjetRoleDTO {
    private Utilisateur utilisateur;
    private Role role;
    private Projet projetRequest;

    public UtilisateurProjetRoleDTO(Utilisateur utilisateur, Role role, Projet projetRequest) {
        this.utilisateur = utilisateur;
        this.role = role;
        this.projetRequest = projetRequest;
    }

    public Utilisateur getUtilisateur() {
        return utilisateur;
    }

    public Projet getProjetRequest() {
        return projetRequest;
    }

    public void setProjetRequest(Projet projetRequest) {
        this.projetRequest = projetRequest;
    }

    public void setUtilisateur(Utilisateur utilisateur) {
        this.utilisateur = utilisateur;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
