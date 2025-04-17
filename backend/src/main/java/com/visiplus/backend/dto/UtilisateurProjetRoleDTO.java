package com.visiplus.backend.dto;

import com.visiplus.backend.models.Role;
import com.visiplus.backend.models.Utilisateur;

public class UtilisateurProjetRoleDTO {
    private UtilisateurLightDTO utilisateur;
    private RoleDTO role;

    public UtilisateurProjetRoleDTO(Utilisateur utilisateur, Role role) {
        this.utilisateur = new UtilisateurLightDTO(utilisateur);
        this.role = new RoleDTO(role);
    }

    public UtilisateurLightDTO getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(UtilisateurLightDTO utilisateur) {
        this.utilisateur = utilisateur;
    }

    public RoleDTO getRole() {
        return role;
    }

    public void setRole(RoleDTO role) {
        this.role = role;
    }
}
