package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UtilisateurServiceImpl implements UtilisateurService {

    @Autowired
    UtilisateurRepository utilisateurRepository;

    @Override
    public List<Utilisateur> findAll() {
        return (List<Utilisateur>) utilisateurRepository.findAll();
    }

    @Transactional
    @Override
    public int create(Utilisateur utilisateur) {

        Optional<Utilisateur> existUser = utilisateurRepository.findByNom(utilisateur.getNom());

        if(existUser.isPresent()){
            return existUser.get().getId();
        }

        return utilisateurRepository.save(utilisateur).getId();
    }

    @Override
    public Utilisateur findById(int id) {

        Optional<Utilisateur> utilisateur = utilisateurRepository.findById(id);

        if(utilisateur.isPresent()){
            return utilisateur.get();
        }

        return utilisateurRepository.findById(id).get();
    }

    @Override
    public Utilisateur findByNom(String nom) {
        Optional<Utilisateur> utilisateur = utilisateurRepository.findByNom(nom);

        if(utilisateur.isEmpty()){
            return null;
        }

        return utilisateur.get();
    }

    ;




}
