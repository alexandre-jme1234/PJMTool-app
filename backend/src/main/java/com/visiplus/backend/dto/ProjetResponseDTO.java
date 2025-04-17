package com.visiplus.backend.dto;

import com.visiplus.backend.models.Projet;

import java.util.List;

public class ProjetResponseDTO {
    private Projet projet;
    private List<UtilisateurRoleDTO> utilisateur_roles;
    private List<UtilisateurProjetDTO> utilisateurs_projet;


    public ProjetResponseDTO(Projet projet, List<UtilisateurRoleDTO> utilisateur_roles, List<UtilisateurProjetDTO> utilisateurs_projet) {
        this.projet = projet;
        this.utilisateur_roles = utilisateur_roles;
        this.utilisateurs_projet = utilisateurs_projet;
    }

    public List<UtilisateurProjetDTO> getUtilisateurs_projet() {
        return utilisateurs_projet;
    }

    public void setUtilisateurs_projet(List<UtilisateurProjetDTO> utilisateurs_projet) {
        this.utilisateurs_projet = utilisateurs_projet;
    }

    public Projet getProjet() {
        return projet;
    }

    public void setProjet(Projet projet) {
        this.projet = projet;
    }

    public List<UtilisateurRoleDTO> getUtilisateur_roles() {
        return utilisateur_roles;
    }

    public void setUtilisateur_roles(List<UtilisateurRoleDTO> utilisateur_roles) {
        this.utilisateur_roles = utilisateur_roles;
    }
}
