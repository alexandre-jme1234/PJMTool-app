package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.ProjetRepository;
import com.visiplus.backend.models.Projet;
import com.visiplus.backend.services.ProjetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ProjetServiceImpl implements ProjetService {

    @Autowired
    ProjetRepository projetRepository;

    @Override
    public int create(Projet projet) {
        return projetRepository.save(projet).getId();
    }

    @Override
    public Projet findByNom(String nom) {
        Optional<Projet> projet = projetRepository.findByNom(nom);

        if(projet.isEmpty()){
            return null;
        }

        return projet.get();
    }
}
