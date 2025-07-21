package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.TacheRepository;
import com.visiplus.backend.models.Tache;
import com.visiplus.backend.services.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.System.Logger;
import java.util.List;
import java.util.Objects;
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

    @Override
    public Optional<Tache> findById(int id) {
        return tacheRepository.findById(id);
    }

    @Override
    public Tache updatePartial(int id, Tache tache, Tache updateTache) {

        if(!Objects.equals(tache.getNom(), updateTache.getNom())){
            tache.setNom(updateTache.getNom());
        }

        if(!Objects.equals(tache.getDescription(), updateTache.getDescription())){
            tache.setDescription(updateTache.getDescription());
        }

        if(!Objects.equals(tache.getDestinataire(), updateTache.getDestinataire())){
            tache.setDestinataire(updateTache.getDestinataire());
        }

        if(!Objects.equals(tache.getCommanditaire(), updateTache.getCommanditaire())){
            tache.setCommanditaire(updateTache.getCommanditaire());
        }

        if(!Objects.equals(tache.getDate_fin(), updateTache.getDate_fin())){
            tache.setDate_fin(updateTache.getDate_fin());
        }

        if(!Objects.equals(tache.getDate_debut(), updateTache.getDate_debut())){
            tache.setDate_debut(updateTache.getDate_debut());
        }

        return tacheRepository.save(tache);
    }

    @Override
    public List<Tache> findByProjetId(int id) {
        return tacheRepository.findByProjetId(id);
    }

    @Override
    public Tache save(Tache tache) {
        return tacheRepository.save(tache);
    }

    @Override
    public boolean delete(int id) {
        Optional<Tache> tache = tacheRepository.findById(id);
        System.out.println("taches __>"+ tache);
        if(tache.isPresent()){
            tacheRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
