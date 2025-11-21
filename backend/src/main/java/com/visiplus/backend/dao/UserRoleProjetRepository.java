package com.visiplus.backend.dao;

import com.visiplus.backend.models.UserRoleProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface UserRoleProjetRepository extends JpaRepository<UserRoleProjet, Integer> {

    UserRoleProjet save(UserRoleProjet userRoleProjet);

    List<UserRoleProjet> findAll();
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM utilisateur_projet_role WHERE projet_id = :projetId", nativeQuery = true)
    void deleteByProjetId(@Param("projetId") int projetId);
}
