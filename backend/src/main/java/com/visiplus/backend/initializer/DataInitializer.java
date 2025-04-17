package com.visiplus.backend.initializer;

import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.models.Role;
import com.visiplus.backend.services.RoleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private RoleService roleService;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Bean
    CommandLineRunner initDatabase() {
        // logger.info("Initialisation des rôles dans la base de données...");
        return args -> {
            // Insertion des rôles
            insertRole("ADMINISTRATEUR", true, true, true, true, true, true, true, true);
            insertRole("MEMBRE", false, true, false, true, true, true, true, true);
            insertRole("OBSERVATEUR", false, false, false, false, true, true, true, true);
        };
    }

    private void insertRole(String nom, boolean canAddMember, boolean canCreateTask, boolean canAssignTask,
                            boolean canUpdateTask, boolean canViewTask, boolean canViewDashboard,
                            boolean canBeNotified, boolean canViewModificationHistory) {
        if (roleService.findByNom(nom) == null) {
            Role role = new Role();
            role.setNom(nom);
            role.setAjouter_membre(canAddMember);
            role.setCreer_tache(canCreateTask);
            role.setAssigne_tache(canAssignTask);
            role.setMaj_tache(canUpdateTask);
            role.setVue_tache(canViewTask);
            role.setVue_tableau_de_bord(canViewDashboard);
            role.setEtre_notifie(canBeNotified);
            role.setVue_historique_modifications(canViewModificationHistory);
            roleService.save(role);
        }
    }
}
