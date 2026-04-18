# Split PDF by Half

Apart from dividing PDF files using a user-defined splitting point, Robomotion enables the implementation of fully automatic logic that doesn't require user input, like always splitting PDF files in half.

## What Split PDF by Half can do

- Calculates a midpoint and splits a PDF into two evenly-sized halves. Demonstrates arithmetic on page counts feeding a splitter.

## Behind the scenes

- The success-message body refers to `..._1.pdf` / `..._2.pdf` but the actual files are named `...-Half 1.pdf` / `...-Half 2.pdf` — that's a mistake in the PA source. Preserve it verbatim for fidelity; document the discrepancy.
- For odd `vCount`, PA assigns `vHalf = (Count - 1) / 2`, then the extract ranges are `1..vHalf` and `vHalf+1..vCount`. That puts **more** pages into Half 2 (the extra page falls into the second half). If the user prefers the opposite convention, flip in the subflow — but don't change it silently.
- `vCount <= 1` is a dead branch in the PA source (no `ELSE IF Count = 1` or `Count = 0` cases). Don't invent handling for it.
