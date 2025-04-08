package com.visiplus.backend.services.impl;

import com.visiplus.backend.dao.TacheRepository;
import com.visiplus.backend.dao.UtilisateurRepository;
import com.visiplus.backend.services.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TacheServiceImpl implements TacheService {

    @Autowired
    TacheRepository tacheRepository;
}
