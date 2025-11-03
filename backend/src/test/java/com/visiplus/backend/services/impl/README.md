# Tests Unitaires des Services - Guide Pédagogique

## 📚 Vue d'ensemble

Cette suite de tests couvre l'ensemble des services de la couche métier de l'application. Chaque classe de test suit les mêmes principes et bonnes pratiques pour faciliter votre apprentissage.

## 🎯 Objectifs pédagogiques

En étudiant ces tests, vous allez apprendre à :

1. **Isoler les dépendances** avec Mockito
2. **Structurer vos tests** selon le pattern AAA (Arrange-Act-Assert)
3. **Tester différents scénarios** (cas nominaux et cas limites)
4. **Vérifier les interactions** avec les repositories
5. **Gérer les exceptions** et les cas d'erreur

## 🏗️ Structure des tests

### Pattern AAA (Arrange-Act-Assert)

Tous les tests suivent cette structure :

```java
@Test
void testMethode_Scenario_ResultatAttendu() {
    // Arrange : Préparation des données et configuration des mocks
    when(repository.method()).thenReturn(expectedValue);
    
    // Act : Exécution de la méthode à tester
    Result result = service.method();
    
    // Assert : Vérification des résultats
    assertEquals(expected, result);
    verify(repository, times(1)).method();
}
```

### Annotations utilisées

- `@ExtendWith(MockitoExtension.class)` : Active Mockito pour les tests
- `@Mock` : Crée un mock du repository
- `@InjectMocks` : Injecte les mocks dans le service
- `@BeforeEach` : Initialise les données avant chaque test
- `@Test` : Marque une méthode comme test
- `@DisplayName` : Donne un nom descriptif au test

## 📋 Description des tests par service

### 1. PrioriteServiceImpl (Simple CRUD)
**Niveau : Débutant**

Tests couverts :
- ✅ Recherche par ID (cas trouvé et non trouvé)
- ✅ Recherche par nom
- ✅ Création avec vérification de doublon
- ✅ Sauvegarde
- ✅ Suppression

**Points clés :**
- Gestion des `Optional`
- Logique de prévention des doublons dans `create()`

### 2. ProjetServiceImpl (CRUD avec liste)
**Niveau : Débutant**

Tests couverts :
- ✅ Création et récupération d'ID
- ✅ Recherche par nom et ID
- ✅ Suppression avec retour de l'objet
- ✅ Récupération de tous les projets

**Points clés :**
- Manipulation de listes
- Gestion des `Optional.empty()`

### 3. RoleServiceImpl (Service minimal)
**Niveau : Débutant**

Tests couverts :
- ✅ Recherche par nom
- ✅ Sauvegarde (création et mise à jour)

**Points clés :**
- Exemple simple pour comprendre les bases
- Distinction création vs mise à jour

### 4. TacheServiceImpl (Logique métier complexe)
**Niveau : Intermédiaire**

Tests couverts :
- ✅ CRUD complet
- ✅ Mise à jour partielle (updatePartial)
- ✅ Recherche par projet
- ✅ Suppression avec vérification d'existence

**Points clés :**
- **Logique métier complexe** : La méthode `updatePartial` ne met à jour que les champs modifiés
- Test de comparaison d'objets avec `Objects.equals()`
- Vérification que seuls les champs changés sont modifiés

### 5. UserRoleProjetImpl (Table de jointure)
**Niveau : Intermédiaire**

Tests couverts :
- ✅ Sauvegarde d'associations
- ✅ Récupération de toutes les associations
- ✅ Gestion d'associations multiples

**Points clés :**
- Manipulation d'entités composites
- Relations Many-to-One
- Gestion des associations multiples pour un même utilisateur

### 6. UtilisateurServiceImpl (Service avec exceptions)
**Niveau : Avancé**

Tests couverts :
- ✅ CRUD complet
- ✅ Création avec prévention de doublons
- ✅ Recherche par nom et email
- ✅ Mise à jour partielle avec validation de nullité
- ✅ Gestion d'exceptions personnalisées

**Points clés :**
- **Gestion d'exceptions** : `findById` lance une exception si non trouvé
- **Validation de nullité** dans `updatePartial`
- **Transaction** avec `@Transactional` (testé implicitement)

## 🔍 Concepts avancés testés

### 1. Mockito - Stubbing
```java
when(repository.findById(1)).thenReturn(Optional.of(entity));
```
Configure le comportement du mock pour retourner une valeur spécifique.

### 2. Mockito - Verification
```java
verify(repository, times(1)).save(entity);
```
Vérifie que la méthode a été appelée exactement 1 fois.

### 3. Mockito - Never
```java
verify(repository, never()).save(any(Entity.class));
```
Vérifie que la méthode n'a jamais été appelée.

### 4. ArgumentMatchers
```java
when(repository.save(any(Entity.class))).thenReturn(entity);
```
Accepte n'importe quel argument du type spécifié.

### 5. Answer pour logique personnalisée
```java
when(repository.save(entity)).thenAnswer(invocation -> {
    Entity saved = invocation.getArgument(0);
    saved.setId(1);
    return saved;
});
```
Permet d'exécuter une logique personnalisée lors de l'appel du mock.

## 🚀 Exécution des tests

### Exécuter tous les tests
```bash
mvn test
```

### Exécuter les tests d'un service spécifique
```bash
mvn test -Dtest=PrioriteServiceImplTest
```

### Générer le rapport de couverture (JaCoCo)
```bash
mvn clean test jacoco:report
```
Le rapport sera disponible dans `target/site/jacoco/index.html`

## 📊 Couverture de code

Les tests couvrent :
- ✅ Tous les cas nominaux (happy path)
- ✅ Les cas limites (null, vide, inexistant)
- ✅ Les exceptions
- ✅ Les validations métier

**Objectif de couverture : > 80%**

## 💡 Bonnes pratiques appliquées

1. **Nommage descriptif** : `testMethode_Scenario_ResultatAttendu`
2. **Un test = un scénario** : Chaque test vérifie un seul comportement
3. **Indépendance** : Les tests ne dépendent pas les uns des autres
4. **Lisibilité** : Structure AAA claire avec commentaires
5. **Assertions explicites** : Messages d'erreur descriptifs
6. **Isolation** : Utilisation de mocks pour isoler la couche service

## 🎓 Exercices suggérés

Pour approfondir votre compréhension :

1. **Ajoutez un test** pour un nouveau scénario dans un service existant
2. **Modifiez un service** et adaptez les tests en conséquence
3. **Créez un nouveau service** avec sa suite de tests complète
4. **Analysez la couverture** et identifiez les branches non testées
5. **Refactorisez** un test pour le rendre plus lisible

## 📖 Ressources complémentaires

- [Documentation JUnit 5](https://junit.org/junit5/docs/current/user-guide/)
- [Documentation Mockito](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web/)

## ❓ Questions de réflexion

1. Pourquoi utilise-t-on des mocks plutôt que de vrais repositories ?
2. Quelle est la différence entre `@Mock` et `@InjectMocks` ?
3. Pourquoi tester les cas d'erreur est-il important ?
4. Comment s'assurer qu'un test est vraiment indépendant ?
5. Quand faut-il utiliser `verify()` dans un test ?

---

**Note** : Ces tests sont conçus dans une optique pédagogique. N'hésite pas à les modifier, les enrichir et à expérimenter pour mieux comprendre les concepts !
