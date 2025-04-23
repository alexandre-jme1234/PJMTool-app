package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.PrioriteRepository;
import com.visiplus.backend.models.Priorite;
import com.visiplus.backend.services.PrioriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PrioriteServiceImpl implements PrioriteService {
    @Autowired
    PrioriteRepository prioriteRepository;


    @Override
    public Priorite findByNom(String nom) {
        return prioriteRepository.findByNom(nom);
    }

    @Override
    public int create(Priorite priorite) {
        Priorite existPriorite = prioriteRepository.findByNom(priorite.getNom());

        if(existPriorite != null){
            return existPriorite.getId();
        } else {
            Priorite saved = prioriteRepository.save(priorite);
            return saved.getId();
        }
    }

    @Override
    public Priorite save(Priorite priorite) {
        return prioriteRepository.save(priorite);
    }
}
