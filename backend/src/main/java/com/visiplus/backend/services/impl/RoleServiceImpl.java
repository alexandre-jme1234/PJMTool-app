package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.RoleRepository;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.services.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public Role findByNom(String nom) {
        return roleRepository.findByNom(nom);
    }

    @Override
    public Role save(Role role) {
        return roleRepository.save(role);
    }
}
