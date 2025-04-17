package com.visiplus.backend.dto;

public class UtilisateurProjetDTO {
    private int utilisateur_id;
    private int projet_id;

    public UtilisateurProjetDTO(int utilisateur_id, int projet_id){
      this.utilisateur_id = utilisateur_id;
      this.projet_id = projet_id;
    };

    public int getUtilisateur_id() {
        return utilisateur_id;
    }

    public void setUtilisateur_id(int utilisateur_id) {
        this.utilisateur_id = utilisateur_id;
    }

    public int getProjet_id() {
        return projet_id;
    }

    public void setProjet_id(int projet_id) {
        this.projet_id = projet_id;
    }
}
