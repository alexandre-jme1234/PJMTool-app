package com.visiplus.backend.services;


import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Utilisateur;

import java.util.Optional;

public interface ProjetService {

    int create(Projet projet);

    Projet findByNom(String nom);

    Projet findById(int id);

};
