package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UserRoleProjetRepository;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.services.UserRoleProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserRoleProjetImpl implements UserRoleProjetService {

    @Autowired
    UserRoleProjetRepository userRoleProjetRepository;

    @Override
    public UserRoleProjet save(UserRoleProjet userRoleProjet) {
        return userRoleProjetRepository.save(userRoleProjet);
    }

    @Override
    public List<UserRoleProjet> findALl() {
        return userRoleProjetRepository.findAll();
    }

    @Override
    public void delete(UserRoleProjet userRoleProjet) {
        userRoleProjetRepository.delete(userRoleProjet);
    }

    @Override
    public void deleteByProjetId(int projetId) {
        userRoleProjetRepository.deleteByProjetId(projetId);
    }
}
