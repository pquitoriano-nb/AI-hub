# AI Hub — React

The AI Team's internal hub: an intake form (like Google Forms) with shared responses, a dashboard, the team directory, Onyx agents and automations per department, and an AI 101 glossary.

Built with React 18 + Vite. No UI library: all styling is in `src/styles.css`, using the AI Hub design-system tokens.

## Run it

You need Node.js 18 or newer.

```bash
npm install
npm run dev        # open the printed http://localhost:5173 link
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

`dist/` is a static site: upload it to Netlify, Vercel, GitHub Pages, Firebase Hosting, or any web host.
Never upload the source files (`src/`, `index.html`) on their own: browsers can't run `.jsx`, so you get a blank page.

## Deploy to GitHub Pages

1. Push this whole folder (including `.github/`) to the `main` branch of your repo.
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open the **Actions** tab and wait for "Deploy to GitHub Pages" to turn green (about 1 minute).
4. Your site is at `https://<your-username>.github.io/<repo-name>/`. Every push to `main` redeploys it.

## Project layout

```
src/
  App.jsx               routing (#home, #intake, #responses, #dashboard, #team, #agents, #learn), shared state, editor mode
  styles.css            all styles; colour tokens at the top (light + dark)
  data/constants.js     departments, request types, tools, statuses, add/edit form fields  ← edit these
  data/glossary.js      AI 101 glossary terms                                              ← edit these
  lib/store.js          data layer (localStorage by default)                               ← swap for a real database
  lib/utils.js          small helpers
  components/           Header, EntitySheet (add/edit dialog), shared UI bits
  pages/                Home, Intake (form + responses), Dashboard, Team, Agents, Learn
```

## Important: where the data is saved

Out of the box, everything is saved in **the browser's localStorage**. That's fine for trying it out, but **each person only sees their own browser's data**: a form submitted on one laptop won't appear on another.

To share responses across the team, connect a real database by replacing `localBackend` in `src/lib/store.js`. The rest of the app only calls `useCollection`, `addDoc`, `updateDoc` and `deleteDoc`, so nothing else changes.

The app uses four collections: `intake`, `team`, `agents`, `automations`.

### Example: Firebase Firestore

1. Create a project at console.firebase.google.com, add a Web app, enable Firestore.
2. `npm install firebase`
3. Replace `localBackend` in `src/lib/store.js` with:

```js
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, addDoc as fsAdd, updateDoc as fsUpdate, deleteDoc as fsDelete, doc,
} from "firebase/firestore";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
});
const db = getFirestore(app);

const firebaseBackend = {
  subscribe: (coll, cb) =>
    onSnapshot(collection(db, coll), (snap) => cb(snap.docs.map((d) => ({ ...d.data(), id: d.id })))),
  add: (coll, data) => fsAdd(collection(db, coll), data),
  update: (coll, id, patch) => fsUpdate(doc(db, coll, id), patch),
  remove: (coll, id) => fsDelete(doc(db, coll, id)),
};

const backend = firebaseBackend; // instead of localBackend
```

4. Put your keys in a `.env` file (`VITE_FB_API_KEY=...` etc.).
5. Set Firestore security rules so that anyone signed in can create `intake` documents, and only the AI Team can write `team`, `agents` and `automations`.

Supabase, Airtable, or a Google Sheet behind an Apps Script web app work the same way: implement `subscribe`, `add`, `update`, `remove`.

## Editor mode

The **Editor mode** switch in the footer shows the add / edit / delete buttons and the status dropdown on responses. It is a convenience switch only, **not security**: anyone can turn it on. Before sharing widely, replace `canEdit` in `App.jsx` with a check against real sign-in (e.g. Firebase Auth or Google sign-in, allowing only the AI Team's emails) and enforce the same rule in your database's security rules.

## Customising

- **Departments, tools, statuses:** `src/data/constants.js`
- **Form questions:** `IntakeForm` in `src/pages/Intake.jsx`
- **Glossary:** `src/data/glossary.js`
- **Colours and fonts:** the `:root` tokens at the top of `src/styles.css` (dark-mode values follow right after)
