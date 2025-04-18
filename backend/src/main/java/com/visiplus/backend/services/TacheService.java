package com.visiplus.backend.services;


import com.visiplus.backend.models.Tache;

public interface TacheService {
    public Tache findByNom(String nom);

    public Tache create(Tache tache);

    public Tache findById(int id);

    public Tache upatePartial(int id, Tache oldTache, Tache newTache);
};
