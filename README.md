# chiridex

Extracts a named color palette from an image.

Upload a reference photo and chiridex clusters it into eight representative
colors, then matches each one against a database of 8,513 named colors — so you
get "Van Dyke Brown" rather than `#3B2A22`. You can also click any pixel in the
image to identify that single color.

## Quickstart

```bash
docker compose up --build
```

Then open <http://localhost:3000>.

## Running without Docker

Docker rebuilds the production Next.js bundle on every change, so for
development run the two halves directly.

**Backend** (http://127.0.0.1:5000):

```bash
cd backend
uv venv
uv pip install -r requirements.txt
uv run flask --app app run
```

**Frontend** (http://localhost:3000):

```bash
npm install
npm run dev
```

The frontend expects the backend at `127.0.0.1:5000`.

## Layout

```
backend/     Flask API, color database, Python deps
pages/       Next.js pages
hooks/       useColorPicker — canvas-based pixel sampling
styles/      CSS modules
```

## How it works

`POST /color/generate_palette` takes an image, resizes it to 64×64 (small
enough that k-means is fast, large enough to preserve the color distribution),
and clusters the pixels into eight groups. Each cluster's mean color is matched
to the nearest entry in `colordb.csv` by Euclidean distance.

`GET /color/<hexcode>` runs the same nearest-color match on a single value.

The color picker is hand-rolled rather than using the browser `EyeDropper` API,
which samples at the OS level and so can pick up pixels outside the page.

## Roadmap

- **Light/shadow families (Reilly method).** Split an image into a light group
  and a shadow group and return a palette for each, plus the value gap between
  them. Needs clustering in Lab rather than RGB, since shadows are distinguished
  from dark materials by color temperature (the `b*` axis) rather than by
  lightness alone.
- **Variable palette size** — currently hardcoded to 8 clusters
  (`backend/app.py`).
- **Other input modes.** The original scope also included random palette
  generation, mood descriptions, and suggestions based on different theories of
  color harmony. None of these are built.

### Smaller cleanups

- Match colors in Lab space instead of RGB. Euclidean distance in RGB doesn't
  track perceived difference, so the nearest name is occasionally not the
  closest-looking one.
- `colordb.csv` is parsed twice at startup — once in `match_helpers.py` (used)
  and once in `app.py` (unused).
