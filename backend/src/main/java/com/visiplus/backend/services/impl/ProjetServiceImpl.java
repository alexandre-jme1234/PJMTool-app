package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.ProjetRepository;
import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.services.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ProjetServiceImpl implements ProjetService {

    @Autowired
    ProjetRepository projetRepository;
}
