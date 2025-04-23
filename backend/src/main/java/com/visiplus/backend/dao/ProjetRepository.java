package com.visiplus.backend.dao;

import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface ProjetRepository extends CrudRepository<Projet, Integer> {
    Projet save(Projet projet);

    Optional<Projet> findByNom(String nom);

    Projet findById(int id);
};
