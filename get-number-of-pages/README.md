# Get Number of Pages in a PDF

While handling PDF files, users may encounter scenarios that require them to extract specific information regarding the files. The available PDF nodes enable users to retrieve various details from PDF files, such as the total number of their pages.

## What Get Number of Pages in a PDF can do

- Custom Form Dialog titled `Find the number of pages in PDF` with one required file input labelled `Select a PDF file:` and Submit `OK`. C…
- Conditional (`Core.Programming.Function`, `outputs: 2`) — branch when `vButtonPressed == "Ok"`; otherwise go straight to the `Finish` lab…
- Split path parts — Function node replicating `File.GetPathPart` to expose `vDirectory` and `vFileNameNoExtension` from `vCustomFormData['…
- Initialise counter — `msg.vCount = 0`.
- Infinite probe loop (`Core.Flow.Label` `ProbeLoop` → body → `Core.Flow.GoTo ProbeLoop`):

## Behind the scenes

- PA's PDF extractor raises a catchable error on out-of-bounds page; that error is the loop-exit signal. The named error label `PageOutOfBoundsError` is referenced only by the `ON ERROR` block in PA — in Robomotion, use `Core.Trigger.Catch` on the Extract node and have the catch handler GoTo the `Finish` label.
- The temp file suffixing (`AddSequentialSuffix`) avoids collisions across iterations; each pass writes `Temp PDF from a desktop flow.pdf`, `Temp PDF from a desktop flow_1.pdf`, etc. Preserve this — even with the immediate `Delete`, the suffix guards against filesystem race conditions.
- The PA flow reaches the `Finish` label both via GoTo (on error) and via fall-through when the outer `IF` is false — in Robomotion, wire both the catch handler *and* the conditional's false-branch to the `Finish` label.
- This is a terrible way to count PDF pages — a "cheap page-count" PDF node almost always exists (e.g. `Robomotion.PDFBox` may expose such a property). Preserve the PA implementation for fidelity, but note the better primitive in comments.
