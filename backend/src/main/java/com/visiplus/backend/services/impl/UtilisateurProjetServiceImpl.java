package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UtilisateurProjetRepository;
import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.UtilisateurProjetService;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurProjetServiceImpl implements UtilisateurProjetService {

    @Autowired
    UtilisateurProjetRepository utilisateurProjetRepository;

};
