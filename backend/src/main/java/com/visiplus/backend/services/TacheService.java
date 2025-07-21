package com.visiplus.backend.services;


import java.util.List;

import com.visiplus.backend.models.Tache;

public interface TacheService {
    public Tache findByNom(String nom);

    public Tache create(Tache tache);

    public Tache findById(int id);

    public Tache updatePartial(int id, Tache oldTache, Tache newTache);

    public Tache save(Tache tache);

    List<Tache> findByProjetId(int id);
};
