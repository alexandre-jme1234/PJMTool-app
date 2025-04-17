package com.visiplus.backend.services;

import com.visiplus.backend.models.Utilisateur;

import java.util.List;

public interface UtilisateurService {

    public List<Utilisateur> findAll();

    public int create(Utilisateur utilisateur);

    public Utilisateur findById(int id);

    public Utilisateur findByNom(String nom);

    public Utilisateur findByEmail(String email);

    public Utilisateur updatePartial(int id, Utilisateur utilisateurExistant, Utilisateur newUtilisateur);

    public Utilisateur save(Utilisateur utilisateur);
}
