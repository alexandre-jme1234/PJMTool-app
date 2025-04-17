package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.TacheRepository;
import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TacheServiceImpl implements TacheService {

    @Autowired
    TacheRepository tacheRepository;

    @Override
    public Tache findByNom(String nom) {
        Optional<Tache> tache = tacheRepository.findByNom(nom);

        if(tache.isEmpty()){
            return null;
        }

        return tache.get();
    }

    @Override
    public Tache create(Tache tache) {
        return tacheRepository.save(tache);
    }
}
