package com.visiplus.backend.dao;

import com.visiplus.backend.models.Priorite;
import com.visiplus.backend.services.PrioriteService;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface PrioriteRepository extends CrudRepository<Priorite, Integer> {

    Optional<Priorite> findById(Integer integer);

    Priorite findFirstByNom(String nom);

    Priorite save(Priorite priorite);

}
