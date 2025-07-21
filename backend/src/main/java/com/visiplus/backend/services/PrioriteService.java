package com.visiplus.backend.services;

import com.visiplus.backend.models.Priorite;

public interface PrioriteService {
    Priorite findByNom(String nom);
    int create(Priorite priorite);
    Priorite save(Priorite priorite);
    void delete(Priorite priorite);
}
