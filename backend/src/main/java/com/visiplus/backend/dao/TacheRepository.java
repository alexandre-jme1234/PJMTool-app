package com.visiplus.backend.dao;

import com.visiplus.backend.models.Tache;
import org.springframework.data.repository.CrudRepository;

public interface TacheRepository extends CrudRepository<Tache, Integer> {
};
