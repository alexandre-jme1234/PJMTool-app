package com.visiplus.backend.dao;

import com.visiplus.backend.models.Tache;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface TacheRepository extends CrudRepository<Tache, Integer> {

    Optional<Tache> findByNom(String nom);

    Tache save(Tache tache);
};
