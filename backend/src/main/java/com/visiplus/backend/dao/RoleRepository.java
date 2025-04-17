package com.visiplus.backend.dao;

import com.fasterxml.jackson.annotation.OptBoolean;
import com.visiplus.backend.models.Role;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RoleRepository extends CrudRepository<Role, Integer> {
    Role findByNom(String nom);

    Role save(String nom);
}
