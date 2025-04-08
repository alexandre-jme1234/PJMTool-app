package com.visiplus.backend.dao;

import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import org.springframework.data.repository.CrudRepository;

public interface ProjetRepository extends CrudRepository<Projet, Integer> {
};
