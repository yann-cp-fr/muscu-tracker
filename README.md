# 💪 Muscu Tracker

Application personnelle de suivi de musculation, adaptée à une reprise en douceur.
Fonctionne sur iPhone et Android, s'installe sur l'écran d'accueil comme une vraie
application, marche hors connexion, et s'héberge gratuitement sur GitHub Pages.

> **Version actuelle : V1 (MVP)** — tu peux déjà réaliser une séance complète :
> choisir une séance, saisir tes poids et répétitions, valider chaque série,
> profiter du chronomètre de repos automatique, et tout est sauvegardé sur ton
> téléphone.

---

## 📖 Sommaire

1. [Ce dont tu as besoin](#1-ce-dont-tu-as-besoin)
2. [Publier l'application (méthode simple, sans ligne de commande)](#2-publier-lapplication-méthode-simple)
3. [Installer l'app sur ton téléphone](#3-installer-lapp-sur-ton-téléphone)
4. [Modifier ton programme d'entraînement](#4-modifier-ton-programme)
5. [Comment marche l'application (pour t'y retrouver)](#5-comment-marche-lapplication)
6. [Foire aux questions / problèmes courants](#6-faq--problèmes-courants)

---

## 1. Ce dont tu as besoin

- Un **compte GitHub** (gratuit : https://github.com/signup).
- C'est tout. Aucune installation, aucune connaissance technique requise.

---

## 2. Publier l'application (méthode simple)

Cette méthode se fait **entièrement dans le navigateur**, sans installer quoi que ce soit.

### Étape 1 — Créer le dépôt

1. Va sur https://github.com/new
2. Dans **Repository name**, tape exactement : `muscu-tracker`
   > ⚠️ **Important** : si tu choisis un autre nom, il faudra le reporter dans le
   > fichier `vite.config.ts` (voir l'encadré plus bas), sinon l'app affichera une
   > page blanche.
3. Laisse le dépôt en **Public** (obligatoire pour GitHub Pages gratuit).
4. Ne coche **rien** d'autre (pas de README, pas de .gitignore — ils sont déjà fournis).
5. Clique **Create repository**.

### Étape 2 — Envoyer les fichiers

1. Sur la page du dépôt vide, clique sur le lien **"uploading an existing file"**
   (au milieu de la page).
2. **Ouvre le dossier `muscu-tracker`** que je t'ai fourni sur ton ordinateur.
3. **Sélectionne tout ce qu'il contient** (tous les fichiers ET les dossiers
   `src`, `public`, `.github`), puis **glisse-dépose** le tout dans la zone GitHub.
   > 💡 Astuce : sélectionne tout avec `Ctrl+A` (Windows) ou `Cmd+A` (Mac) une fois
   > dans le dossier, puis glisse. Assure-toi que le dossier caché `.github` est
   > bien inclus — il contient la publication automatique.
4. En bas, clique **Commit changes**.

### Étape 3 — Activer GitHub Pages

1. Dans ton dépôt, va dans **Settings** (onglet en haut).
2. Menu de gauche → **Pages**.
3. Sous **Build and deployment**, dans **Source**, choisis **GitHub Actions**.
   > Ne choisis PAS "Deploy from a branch". On utilise Actions, c'est déjà configuré.
4. C'est fait. GitHub va construire l'application automatiquement.

### Étape 4 — Attendre la construction (~2 min)

1. Va dans l'onglet **Actions** de ton dépôt.
2. Tu verras une tâche "Deploy to GitHub Pages" en cours (rond orange), puis
   validée (coche verte).
3. Une fois la coche verte, ton app est en ligne à cette adresse :

   ```
   https://TON-PSEUDO.github.io/muscu-tracker/
   ```

   (remplace `TON-PSEUDO` par ton nom d'utilisateur GitHub)

Ouvre cette adresse sur ton téléphone → passe à l'étape 3 pour l'installer.

---

> ### 🔧 Encadré — Si tu as choisi un autre nom que `muscu-tracker`
>
> Ouvre le fichier `vite.config.ts`, trouve la ligne :
> ```ts
> const REPO_NAME = 'muscu-tracker'
> ```
> et remplace `muscu-tracker` par le nom exact de ton dépôt. Renvoie le fichier
> modifié sur GitHub. La reconstruction se relance toute seule.

---

## 3. Installer l'app sur ton téléphone

L'application est une **PWA** : elle s'installe comme une vraie app, sans passer
par l'App Store ni le Play Store.

### Sur iPhone (Safari)

1. Ouvre l'adresse de ton app dans **Safari** (pas Chrome).
2. Touche le bouton **Partager** (le carré avec une flèche vers le haut).
3. Descends et touche **« Sur l'écran d'accueil »**.
4. Touche **Ajouter**. L'icône apparaît sur ton écran d'accueil. 🎉

### Sur Android (Chrome)

1. Ouvre l'adresse de ton app dans **Chrome**.
2. Touche le menu **⋮** (trois points en haut à droite).
3. Touche **« Installer l'application »** (ou « Ajouter à l'écran d'accueil »).
4. Confirme. L'icône apparaît. 🎉

Une fois installée, l'app fonctionne **hors connexion** et en plein écran.

---

## 4. Modifier ton programme

Tout ton programme d'entraînement tient dans **un seul fichier** :
`src/data/program.json`. Tu peux le modifier sans toucher au code.

### Structure d'un exercice

```json
{
  "name": "Développé incliné haltères",
  "muscleGroup": "Pectoraux (haut)",
  "sets": 3,
  "reps": "12",
  "tempo": "3-1-1-0",
  "rest": 90,
  "targetWeight": 18,
  "tips": [
    "Banc à 30°, dos bien calé",
    "Omoplates serrées et basses"
  ]
}
```

| Champ          | Signification                                   | Obligatoire |
|----------------|-------------------------------------------------|-------------|
| `name`         | Nom de l'exercice                               | oui         |
| `muscleGroup`  | Groupe musculaire (affiché à droite du nom)     | oui         |
| `sets`         | Nombre de séries prévues                        | oui         |
| `reps`         | Répétitions (texte libre, ex `"10-12"`)         | oui         |
| `tempo`        | Tempo (ex `"3-1-1-0"`)                           | non         |
| `rest`         | Temps de repos **en secondes**                  | oui         |
| `targetWeight` | Charge cible en kg (pré-remplie dans la saisie) | non         |
| `tips`         | Liste de conseils (repliables dans l'app)       | non         |

### Pour modifier

1. Sur GitHub, ouvre `src/data/program.json`.
2. Clique sur l'icône **crayon** (✏️) en haut à droite du fichier.
3. Modifie ton programme (ajoute des exercices, change les charges…).
4. En bas, clique **Commit changes**.
5. L'app se reconstruit et se met à jour toute seule en ~2 min.

> 💡 Tu peux copier-coller un bloc `{ ... }` d'exercice pour en ajouter un nouveau.
> Pense juste à séparer chaque exercice par une virgule.

---

## 5. Comment marche l'application

Petit tour du code, pour t'y retrouver quand tu voudras faire évoluer l'app avec
mon aide. L'idée directrice : **les données, la logique et l'affichage sont séparés**.

```
src/
├── data/
│   └── program.json      → TON programme (le seul fichier "contenu" à éditer)
├── types/
│   └── index.ts          → la "forme" des données (le vocabulaire de l'app)
├── utils/
│   ├── storage.ts        → LE seul fichier qui sait sauvegarder/lire les données
│   └── helpers.ts        → petites fonctions (dates, identifiants, formatage)
├── hooks/                → la logique (charger le programme, l'historique, le chrono)
│   ├── useProgram.ts
│   ├── useWorkouts.ts
│   └── useTimer.ts
├── components/           → les briques d'affichage réutilisables
│   ├── ui.tsx            → carte, bouton, titre de page
│   ├── BottomNav.tsx     → la barre de navigation du bas
│   ├── CollapsibleTips.tsx → les conseils repliables
│   └── RestTimer.tsx     → le chronomètre de repos
├── pages/                → les écrans (un par onglet)
│   ├── Dashboard.tsx     → 🏠 Tableau de bord
│   ├── Sessions.tsx      → 💪 Liste des séances
│   ├── SessionActive.tsx → l'écran d'une séance en cours (le cœur)
│   └── Placeholders.tsx  → Historique / Progression / Réglages (à venir)
├── App.tsx               → assemble tout + la navigation
└── main.tsx              → point de démarrage
```

### Le point important : `storage.ts`

Toutes les sauvegardes passent par ce **seul fichier**. Aujourd'hui il utilise le
LocalStorage du navigateur. Le jour où tu voudras stocker des photos ou synchroniser
dans le cloud, on ne modifiera **que ce fichier**, sans toucher au reste. C'est ce
qui garde l'app simple à faire évoluer.

---

## 6. FAQ / problèmes courants

**L'app affiche une page blanche après publication.**
→ Le nom du dépôt ne correspond pas à `REPO_NAME` dans `vite.config.ts`. Vérifie
qu'ils sont **strictement identiques** (voir l'encadré de l'étape 2).

**Je ne vois pas le dossier `.github` quand je glisse mes fichiers.**
→ C'est un dossier "caché". Sur Mac, affiche les fichiers cachés avec
`Cmd+Shift+.` dans le Finder. Sur Windows, active "Éléments masqués" dans
l'onglet Affichage de l'explorateur. Ce dossier est indispensable : il contient
la publication automatique.

**Mes données ont-elles disparu ?**
→ Les données sont stockées **dans le navigateur de ton téléphone**. Elles restent
tant que tu ne vides pas les données du site. La sauvegarde par fichier
(export/import) arrivera en **Version 2** pour pouvoir changer de téléphone sans
rien perdre.

**Comment mettre à jour l'app plus tard ?**
→ Chaque fois qu'un fichier est modifié sur GitHub, l'app se reconstruit et se
publie automatiquement. Sur ton téléphone, il suffit de rouvrir l'app (elle se met
à jour toute seule à l'ouverture).

**Est-ce que quelqu'un d'autre peut voir mes données ?**
→ Non. Le code est public (c'est nécessaire pour l'hébergement gratuit), mais tes
**données d'entraînement** restent uniquement sur ton téléphone. Rien n'est envoyé
sur internet.

---

## 🗺️ La suite (versions prévues)

- **V2 — Historique** : consulter, modifier, supprimer tes séances passées + export/import JSON.
- **V3 — Progression** : graphiques, records personnels, volume hebdomadaire.
- **V4 — Expérience** : animations, raccourcis de saisie, optimisations mobile.
- **V5 — Préparer l'avenir** : plusieurs programmes, photos, suivi du poids de corps…

---

*Prends soin de ton dos : à la moindre douleur qui descend dans la jambe, on
arrête l'exercice. Bon entraînement 💪*
