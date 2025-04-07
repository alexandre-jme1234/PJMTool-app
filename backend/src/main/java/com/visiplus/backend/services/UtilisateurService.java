package com.visiplus.backend.services;

import com.visiplus.backend.models.Utilisateur;

import java.util.List;

public interface UtilisateurService {

    public List<Utilisateur> findAll();

    public int create(Utilisateur utilisateur);

    public Utilisateur findById(int id);

}
