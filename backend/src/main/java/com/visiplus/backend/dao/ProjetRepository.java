package com.visiplus.backend.dao;

import com.visiplus.backend.models.Projet;
import com.visiplus.backend.models.Tache;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ProjetRepository extends CrudRepository<Projet, Integer> {
    Projet save(Projet projet);

    Optional<Projet> findByNom(String nom);

    void delete(Projet projet);

    List<Projet> findAll();
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM projet_tache WHERE projet_id = :projetId", nativeQuery = true)
    void deleteProjetTacheRelations(@Param("projetId") int projetId);
};
