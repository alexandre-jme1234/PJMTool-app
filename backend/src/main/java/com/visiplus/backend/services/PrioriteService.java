package com.visiplus.backend.services;

import com.visiplus.backend.models.Priorite;

import java.util.Optional;

public interface PrioriteService {
    Optional<Priorite> findById(Integer priorite_id);
    Priorite findByNom(String nom_priorite);
    int create(Priorite priorite);
    Priorite save(Priorite priorite);
    void delete(Priorite priorite);
}
