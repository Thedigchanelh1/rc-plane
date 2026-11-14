# RC Plane: how it flies

Static Vite + React + Three.js site. No backend: the airflow physics is `src/physics.js`.

    npm install
    npm run dev        # local
    npm run build      # output in dist/ (Vercel: Vite preset, no env vars)

## Changing the plane
- Part names and positions: `src/config.js`.
- Visual editing: open the site with `?edit` on the end of the address (e.g. http://localhost:5173/?edit), change names and positions, press "Copy JSON" and paste it over DEFAULT_PARTS in `config.js`. Edit mode is hidden from normal visitors.
- Explanations of each part: `src/info.js`.

Wind data: Open-Meteo public API for Bengaluru, fetched in the browser.
