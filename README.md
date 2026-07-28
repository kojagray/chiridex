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

See [docs/light-shadow-plan.md](docs/light-shadow-plan.md) for the
implementation plan behind the first two items.

- **Light/shadow families (Reilly method).** Rank the palette by lightness and
  let the user assign each swatch to the light or shadow family, then report the
  value gap between the two. The assignment has to be the user's: whether a
  mid-grey is a white wall in shade or a grey wall in sun depends on
  understanding the scene, and no amount of arithmetic on the pixel can tell you
  which. Clustering in Lab matters here because it keeps a warm sunlit dark and
  a cool shadow in *separate* swatches — otherwise they can merge into one and
  there is no way to tag them differently.
- **Value-only view.** Render the image as pure `L*` greyscale, which is what
  squinting at a reference is meant to approximate. Doing it in Lab avoids the
  usual desaturation bug where pure green and pure blue come out the same shade
  despite being far apart in lightness.
- **Posterize to N value steps.** Flatten the image to 3–9 flat greys — the
  classic notan / value study. Cluster on `L*` alone and paint each pixel its
  cluster's value. The light/shadow view is this with N=2.
- **Terminator outline.** Trace the boundary between the two families; it comes
  free once the family mask exists, and it's the hardest edge to place by eye.
- **Compression preview.** When the families overlap, show what the image would
  look like with the shadows squeezed into a tighter band — the adjustment the
  painter would actually have to make. The only item here that suggests what to
  *do* rather than reporting what's wrong.
- **Export the palette** as a PNG strip with names and values, so it can sit
  next to a canvas instead of only in a browser tab.
- **Variable palette size** — currently hardcoded to 8 clusters
  (`backend/app.py`).
- **Other input modes.** The original scope also included random palette
  generation, mood descriptions, and suggestions based on different theories of
  color harmony. None of these are built.

### Smaller cleanups

- Match colors in Lab space instead of RGB. Euclidean distance in RGB doesn't
  track perceived difference, so the nearest name is occasionally not the
  closest-looking one.
    - basically: better matches and ranking by accurate "brightness"
- colorsdb should have a lab axis as well
