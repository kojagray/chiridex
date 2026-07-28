# Light/shadow families — implementation plan

Splitting a reference image into a light family and a shadow family, after the
Reilly method. The rule being tested is that every value in the light family
should be lighter than every value in the shadow family — if they overlap, the
big light/shadow pattern stops reading and the picture goes muddy.

Each stage below is meant to be landed and looked at on its own. Stages 1 and 2
are useful whether or not the rest ever gets built.

## What the software does and does not decide

The software finds the colors. **The user decides which family each one is in.**

This is not a shortcut. A mid-grey patch might be a white wall in shade or a
grey wall in sun; telling them apart needs an understanding of the scene that
isn't recoverable from the pixel. Every pixel is roughly

```
what you see  =  material color  ×  how much light lands on it
```

— one equation, two unknowns. Splitting them apart is intrinsic image
decomposition, an open research problem, and the naive substitute (threshold on
lightness) reproduces exactly the beginner error the technique exists to
correct: it files a black shirt in sunlight under "shadow" and a white shirt in
shade under "light".

So the axes divide up like this:

| | role |
|---|---|
| `L*` | ranks the swatches darkest → lightest |
| `a*`, `b*` | keep same-lightness colors in separate swatches, and drive naming |
| the user | assigns each swatch to a family |

---

## Stage 1 — `rgb_to_lab`

One function in `backend/match_helpers.py`, no behaviour change anywhere.

sRGB → linear RGB → XYZ → Lab. Vectorized over an `(..., 3)` array so it works
on a single color, a palette, or a whole image.

**Verify:** white `(255,255,255)` must give exactly `L* 100, a* 0, b* 0`; black
must give `L* 0`; mid-grey `(128,128,128)` gives `L* ≈ 53.6`.

## Stage 2 — match color names in Lab

Convert `colordb.csv` to Lab once at import and run the nearest-neighbour search
there instead of in RGB. Euclidean distance in RGB doesn't track perceived
difference, so the nearest name is occasionally not the closest-looking one.

Costs one conversion at boot. No API change, no UI change — names just get
better. Worth landing separately so any regression is obvious.

## Stage 3 — cluster in Lab

Swap the k-means input from RGB to Lab.

Also pin `random_state`: k-means is currently non-deterministic, so the same
photo gives slightly different swatches on each upload.

**Verify:** an image containing a warm sunlit dark and a cool shadow of similar
lightness should now produce two swatches rather than one.

## Stage 4 — the label mask

k-means already assigns every pixel a cluster; reshaping `km.labels_` to the
image dimensions gives a mask. Ship it to the browser as a PNG (cluster id in
the grey channel) — as raw JSON it would be megabytes.

Downscale for transport with `Image.NEAREST`, and cap the long edge at ~1536px:
the overlay's useful ceiling is display size, not image size.

**Verify:** hit the endpoint and open the returned PNG. Should be flat regions,
around 20 KB.

## Stage 5 — ranked palette UI

Show the swatches in one continuous ranking by `L*`, not pre-sorted into two
boxes, with a boundary the user places.

A single boundary handles most images, but it is still a manual lightness
threshold, so it can't express "this dark swatch is in sunlight". Per-swatch
override is required, not optional — and those exceptions are precisely the
cases that make a reference hard to paint.

Showing `b*` per swatch (warm/cool) is useful decision support here: a dark warm
swatch is more likely lit, a dark cool one more likely in shadow.

## Stage 6 — overlays

Two render modes over the same mask:

- **cluster highlight** — hover a swatch, veil every pixel not in that cluster.
  Answers "where does this color actually live?", which is what makes the
  family judgment possible at a glance.
- **family view** — light-family pixels one tint, shadow-family another. This is
  the actual diagnostic: it shows whether the two-value pattern reads as a clean
  shape or a scattered mess.

The overlay canvas sits in `.imageWrapper` with the same `object-fit: contain`
as the `<img>`, so both letterbox identically. It needs `pointer-events: none`
or it swallows the color-picker clicks.

## Stage 7 — the gap

Darkest light minus lightest shadow. Positive means the families are cleanly
separated; negative means they overlap and by how much.

Use percentiles rather than min/max — a single blown-out specular pixel or one
dark speck otherwise decides the number. Speculars are reflections of the light
source rather than values of the form, and are better excluded from the range
entirely.

Photographs routinely fail this test. That isn't the tool being wrong; it's the
reason the discipline exists. The painter's job is to design a cleaner
separation than the reference actually has, so the honest output is "here's
where your reference is muddy", not a pass/fail grade.

---

## Traps

**Don't resize before clustering.** Resizing averages neighbouring pixels, which
invents colors the image never contained. An image of pure red and pure blue
stripes, resized to 64×64, produced five colors — all of them purple, none
present in the original. Sampling real pixels instead is both more accurate and
cheaper than the resize it replaces.

**Lab does not fix that.** Averaging red and blue gives `(128,0,128)` in RGB and
`(202,0,136)` in Lab — both purple, neither in the image. Averaging invents
colors in any space. Lab fixes *distance*, not averaging. Note the distinction
between a cluster mean (legitimate: one swatch standing for many similar pixels)
and resize averaging (a bug: blending unrelated neighbours before clustering
runs).

**`Image.NEAREST` on label masks is mandatory.** Cluster ids are names, not
amounts. Interpolating between id 2 and id 6 yields 4 — a cluster those pixels
were never in, silently wrong at every edge.

**k-means is the right algorithm here.** HDBSCAN produces noise points (`-1`),
which would leave holes in the mask, and photos rarely have the density valleys
it looks for. Agglomerative clustering can pick the cluster count automatically
via a ΔE threshold, which is genuinely attractive, but it needs the distance
between every pair of points — ~10 GB at 50k pixels, ~144 TB at 6M. It cannot
run on a full-resolution image. k-means is linear and handles it.

**Background pollutes the statistics.** A photo's background usually isn't part
of the subject's light/shadow design but will happily dominate the distribution.
A crop step probably has to exist before the numbers mean much.
