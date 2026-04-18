# Split PDF into Parts

As PDF files are a widespread way to share information, a common requirement is splitting them into parts for further processing. Robomotion allows users to split PDF files by a set number of pages without struggle.

## What Split PDF into Parts can do

- Divides a PDF into N equal-sized slices and writes each part out as its own file. A general-purpose chunker for large documents.

## Behind the scenes

- The output files all share the name `Output Split.pdf` with automatic numeric suffixing — the *second* part becomes `Output Split_1.pdf`, the *third* `Output Split_2.pdf`, etc. The dialog points the user to the directory, not to individual file names, because the suffix scheme is opaque.
- The "single page vs range" split on `vPreviousPage + 1 == vCurrentPage` is important: PA's `ExtractPages` rejects a range where start==end (e.g. `5-5`), so the code degrades to a single-page selection for that case. Preserve the branch.
- Two distinct named errors feed the same `OutOfBounds` label from the range branch. Wire both into one `Core.Flow.GoTo OutOfBounds` from the Catch.
