package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UserRoleProjetRepository;
import com.visiplus.backend.models.UserRoleProjet;
import com.visiplus.backend.services.UserRoleProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRoleProjetImpl implements UserRoleProjetService {

    @Autowired
    UserRoleProjetRepository userRoleProjetRepository;

    @Override
    public UserRoleProjet save(UserRoleProjet userRoleProjet) {
        return userRoleProjetRepository.save(userRoleProjet);
    }
}
