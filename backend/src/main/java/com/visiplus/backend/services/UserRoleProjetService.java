package com.visiplus.backend.services;

import com.visiplus.backend.models.UserRoleProjet;

import java.util.List;

public interface UserRoleProjetService {

    public UserRoleProjet save(UserRoleProjet userRoleProjet);

    public List<UserRoleProjet> findALl();
    
    public void delete(UserRoleProjet userRoleProjet);
    
    public void deleteByProjetId(int projetId);
}
