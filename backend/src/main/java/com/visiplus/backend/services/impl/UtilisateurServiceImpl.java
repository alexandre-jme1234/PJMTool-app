package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Utilisateur;
import com.visiplus.backend.services.UtilisateurService;
import jdk.jshell.execution.Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
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
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec id " + id));
    }

    @Override
    public Utilisateur findByNom(String nom) {
        Optional<Utilisateur> utilisateur = utilisateurRepository.findByNom(nom);

        if(utilisateur.isEmpty()){
            return null;
        }

        return utilisateur.get();
    }

    @Override
    public Utilisateur findByEmail(String email) {
        Optional<Utilisateur> utilisateur = utilisateurRepository.findByEmail(email);

        if(utilisateur.isEmpty()){
            return null;
        }

        return utilisateur.get();
    }

    @Override
    public Utilisateur updatePartial(int id, Utilisateur utilisateurExistant, Utilisateur newUtilisateur) {

        if (newUtilisateur == null || utilisateurExistant == null) {
            return null;
        }

        if(!Objects.equals(utilisateurExistant.getEtat_connexion(), newUtilisateur.getEtat_connexion())) {
            utilisateurExistant.setEtat_connexion(newUtilisateur.getEtat_connexion());
        }

        return utilisateurRepository.save(utilisateurExistant);
    }

    @Override
    public Utilisateur save(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    };


}
