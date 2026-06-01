# Date invite 💕

Malá interaktívna stránka na pozvanie na date (slovensky).

## Spustenie

```bash
npm install
npm run dev
```

Otvor `http://localhost:5173` v prehliadači.

## Live link (GitHub Pages)

Po pushnutí na `main` sa stránka automaticky nasadí:

**https://oblacnecerealie.github.io/ninadate/**

## Build na nasadenie

```bash
npm run build
```

Súbory budú v priečinku `dist/`.

## Email notifikácie

Odpovede sa odosielajú na **bastymichalko@gmail.com** cez [FormSubmit](https://formsubmit.co).

**Dôležité (prvé spustenie):** Pri prvom odoslaní ti FormSubmit pošle na Gmail aktivačný email. Klikni na odkaz v ňom — až potom budú ďalšie odpovede chodiť automaticky.

## Čo stránka robí

1. **„Pôjdeš so mnou na date?“** — tlačidlo Nie sa vyhýba kurzoru, Áno spustí oslavu
2. Výber: **Kedy prídem po teba?** (čas) alebo **Ktorý čas filmu?** (17:30 / 20:00)
3. Po **Môže byť** — stránka „Teším sa :P“ a email s jej voľbou
