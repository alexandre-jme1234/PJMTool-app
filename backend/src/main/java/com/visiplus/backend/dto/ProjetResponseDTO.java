package com.visiplus.backend.dto;

import java.util.Date;

public class ProjetResponseDTO {
    private int id;
    private String nom;
    private String description;
    private Date date_echeance;
    private Date date_creation;

    public ProjetResponseDTO(int id, String nom, String description, Date date_echeance, Date date_creation) {
        this.id = id;
        this.nom = nom;
        this.description = description;
        this.date_echeance = date_echeance;
        this.date_creation = date_creation;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Date getDate_echeance() { return date_echeance; }
    public void setDate_echeance(Date date_echeance) { this.date_echeance = date_echeance; }

    public Date getDate_creation() { return date_creation; }
    public void setDate_creation(Date date_creation) { this.date_creation = date_creation; }
}
