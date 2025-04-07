package com.visiplus.backend.dao;

import com.visiplus.backend.models.Utilisateur;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface UtilisateurRepository extends CrudRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByNom(String nom);
}
