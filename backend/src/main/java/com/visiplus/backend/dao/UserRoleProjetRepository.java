package com.visiplus.backend.dao;

import com.visiplus.backend.models.UserRoleProjet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRoleProjetRepository extends JpaRepository<UserRoleProjet, Integer> {

    UserRoleProjet save(UserRoleProjet userRoleProjet);

    List<UserRoleProjet> findAll();
}
