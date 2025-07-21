package com.visiplus.backend.services;


import java.util.List;
import java.util.Optional;

import com.visiplus.backend.models.Tache;

public interface TacheService {
    public Tache findByNom(String nom);

    public Tache create(Tache tache);

    public Optional<Tache> findById(int id);

    public Tache updatePartial(int id, Tache oldTache, Tache newTache);

    public Tache save(Tache tache);

    List<Tache> findByProjetId(int id);
    
    public boolean delete(int id);
};
