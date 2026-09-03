# RA9MANA DZ — Site vitrine statique

Site vitrine (showcase) statique, sans backend, pour l'écosystème RA9MANA DZ.
Le site présente la marque et redirige vers les produits (chaque produit vit
sur son propre domaine).

## Aperçu local

Les traductions sont directement embarquées dans `js/locales.js` (généré à
partir des fichiers `locales/*.json`, gardés comme source lisible pour les
traducteurs). Résultat : le site fonctionne même en ouvrant `index.html`
directement en double-clic (`file://`), sans serveur ni build.

Pour un confort de développement identique à la production (et pour tester
le rechargement, les ancres, etc.), un petit serveur local reste pratique :

```bash
# Python
python3 -m http.server 8080

# ou Node
npx serve .
```

Puis ouvrez `http://localhost:8080`.

Sur un hébergement statique réel (GitHub Pages, Netlify, Vercel, Cloudflare
Pages…) tout fonctionne nativement, sans configuration.

## Structure du projet

```
index.html            Page d'accueil (une seule page, sections ancrées)
library.html           Bibliothèque juridique — voir section dédiée plus bas
submit.html             Contribuer à la bibliothèque
admin.html               Admin local de la bibliothèque (aucun backend)
css/styles.css         Design system complet (tokens, layout, RTL, animations)
data/library.json       Données de la Bibliothèque juridique
books/, covers/         Fichiers PDF et images de la bibliothèque
js/
  products.js          Configuration centralisée des produits + catégories
  i18n.js               Moteur i18n (chargement des locales, RTL, persistance)
  main.js               Comportement du site (rendu dynamique, nav, formulaire…)
  simple-header.js       En-tête/menu/toast partagés par les pages secondaires
  library-*.js, reference-form.js, submit.js, admin.js   Bibliothèque juridique
locales/
  fr.json  en.json  ar.json     Toutes les chaînes de l'interface, par langue
assets/
  brand/logo.png        Logo fourni (ne pas modifier)
  images/                Photos sources fournies
  images/treated/        Versions "duotone" (teintées à la charte RA9MANA)
  products/              Illustrations de catégories produits (SVG)
  icons/icons.svg         Sprite d'icônes réutilisables (currentColor)
robots.txt, sitemap.xml  SEO technique
```

## Ajouter un nouveau produit

Ouvrez `js/products.js` et ajoutez un objet au tableau `RA9MANA_PRODUCTS` :

```js
{
  id: "my-product",
  category: "medical", // medical | education | restaurant | business
  status: "live",       // "live" ou "soon"
  icon: "medical",
  name:        { fr: "...", en: "...", ar: "..." },
  description: { fr: "...", en: "...", ar: "..." },
  benefit:     { fr: "...", en: "...", ar: "..." },
  image: "assets/products/my-product.svg",
  url: "https://my-product.ra9mana.dz"
}
```

Le site se met à jour automatiquement : aucune autre modification n'est
nécessaire. Tant que `url` vaut `"#"` ou que `status` vaut `"soon"`, le bouton
affiche "Bientôt disponible" au lieu d'un lien mort.

## Ajouter une nouvelle catégorie

Ajoutez une entrée dans `RA9MANA_CATEGORIES` (dans `js/products.js`), une
icône correspondante dans `assets/icons/icons.svg` (symbole `icon-xxx`), et
les clés de traduction `ecosystem.categoryXxx` / `ecosystem.categoryXxxDesc`
dans les 3 fichiers `locales/*.json`.

## Traductions

Toutes les chaînes d'interface (navigation, boutons, sections, footer,
métadonnées SEO) vivent dans `locales/fr.json`, `locales/en.json` et
`locales/ar.json` — c'est la source à éditer. Ces fichiers sont ensuite
reflétés dans `js/locales.js` (un objet JS simple) afin que le site n'ait
besoin d'aucune requête réseau pour changer de langue : si vous modifiez un
fichier JSON, reportez le même changement dans `js/locales.js` (ou
régénérez-le). Les textes propres à un produit (nom, description, bénéfice)
vivent directement dans `js/products.js`, dans les mêmes trois langues.

La langue choisie est mémorisée dans `localStorage` et restaurée au
rechargement. L'arabe bascule automatiquement tout le site en `dir="rtl"`
(mise en page, alignement, sens des flèches et icônes).

## Remplacer une image

- Logo : remplacez `assets/brand/logo.png` (mêmes proportions recommandées).
- Illustrations produits : remplacez les fichiers dans `assets/products/`
  (gardez le même nom de fichier, ou mettez à jour le champ `image` dans
  `js/products.js`).
- Photos de section : les fichiers sources sont dans `assets/images/`, et
  leurs versions teintées à la charte (cyan/orange sur fond marine) dans
  `assets/images/treated/`. Ces dernières sont celles utilisées par le CSS.

## Formulaire de contact

Le site est 100% statique : le formulaire de contact ouvre le client e-mail
du visiteur via `mailto:` (aucune donnée n'est envoyée à un serveur). Pour
une vraie soumission de formulaire, branchez un service tiers (Formspree,
Netlify Forms, etc.) dans `js/main.js` (`initContactForm`).

## Bibliothèque juridique (Legal Library)

Nouvelle section indépendante, construite avec la même identité visuelle et
le même moteur i18n que le reste du site — 100% statique, sans backend.

```
library.html            Page publique : recherche, filtres, tri, fiches
submit.html              Formulaire public de contribution (génère un .zip)
admin.html                Admin local (navigateur uniquement) pour préparer
                           les données/fichiers avant de les pousser sur GitHub
data/library.json         Source de données de la bibliothèque (une entrée = un objet)
books/                    Fichiers PDF des références (nom = id de la référence)
covers/                   Images de couverture + photos de contributeurs
js/
  library-types.js        Liste centrale des 28 types de référence (extensible)
  library-common.js       Chargement des données, recherche/filtre, validation
  library-data.js          Copie embarquée de data/library.json (secours file://)
  reference-form.js         Logique de formulaire partagée (submit + admin)
  library.js, submit.js, admin.js   Contrôleurs propres à chaque page
```

**Ajouter une référence sans toucher au code** : ouvrez `admin.html` dans un
navigateur (double-clic sur le fichier suffit), remplissez le formulaire
« Ajouter une référence », puis dans l'onglet « Exporter » cliquez sur
**⬇️ Export Library**. Un fichier `.zip` est généré contenant `data/library.json`
(fusionné avec l'existant), ainsi que les PDF et couvertures. Décompressez-le,
copiez son contenu dans le projet (en remplaçant `data/library.json`), puis :

```bash
git add .
git commit -m "Add new library references"
git push
```

Aucune référence ne s'affiche publiquement tant que son `status` n'est pas
`"published"` (les autres valeurs — `draft`, `pending`, `rejected` —
préparent un futur système de modération sans nécessiter de refonte).

**Ajouter un type de référence** : ajoutez une entrée à `RA9MANA_LIBRARY_TYPES`
dans `js/library-types.js`, puis la clé de traduction `libraryTypes.<id>`
correspondante dans les 3 fichiers `locales/*.json` (et `js/locales.js`). Le
filtre, les badges et le formulaire la prennent en compte automatiquement.

**Contribution publique** : `submit.html` permet à un visiteur de préparer
sa contribution (les mêmes champs qu'`admin.html`, sans le choix du statut)
et de télécharger un `.zip` prêt à envoyer par e-mail à l'équipe RA9MANA pour
vérification et intégration.

## Déploiement

Le dossier est déployable tel quel sur n'importe quel hébergeur statique :

- **GitHub Pages** : poussez le contenu sur la branche `main` (ou `gh-pages`)
  et activez Pages dans les réglages du dépôt.
- **Netlify / Vercel / Cloudflare Pages** : importez le dossier, aucune
  commande de build n'est nécessaire (site statique pur).

Pensez à mettre à jour l'URL canonique dans `index.html`
(`<link rel="canonical">`) et `sitemap.xml` avec le domaine final.
