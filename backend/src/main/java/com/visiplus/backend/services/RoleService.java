package com.visiplus.backend.services;

import com.visiplus.backend.models.Role;

public interface RoleService {
    Role findByNom(String nom);
    Role save(Role role);
}
