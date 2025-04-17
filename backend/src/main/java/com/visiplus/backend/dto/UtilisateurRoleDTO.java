package com.visiplus.backend.dto;

public class UtilisateurRoleDTO {
    private int utilisateur_id;
    private int role_id;

    public UtilisateurRoleDTO(int utilisateur_id, int role_id) {
        this.utilisateur_id = utilisateur_id;
        this.role_id = role_id;
    }

    public int getUtilisateur_id() {
        return utilisateur_id;
    }

    public void setUtilisateur_id(int utilisateur_id) {
        this.utilisateur_id = utilisateur_id;
    }

    public int getRole_id() {
        return role_id;
    }

    public void setRole_id(int role_id) {
        this.role_id = role_id;
    }
}
