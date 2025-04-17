package com.visiplus.backend.dto;

import com.visiplus.backend.models.Role;

public class RoleDTO {
    private int id;
    private String nom;

    public RoleDTO(Role role) {
        this.id = role.getId();
        this.nom = role.getNom();
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
}
