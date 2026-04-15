# Get Images from PDF

**Level:** Beginner

## Description
Apart from text content, PDF files can contain important information in the form of images. Robomotion offers a PDF node that extracts images from PDF files and enables users to access and process these images independently of the original file.

## Objective
Extract every embedded image from a PDF into an output folder, one file per image, with predictable names.

## Prerequisites
- Robomotion PDF package + Files package
- Source PDF with embedded images (`./docs/brochure.pdf`)
- Output folder `./docs/images/`

## Steps
1. **Create Folder** — ensure `./docs/images/` exists.
2. **Extract PDF Images** — input `./docs/brochure.pdf`, output folder `./docs/images/`, filename prefix `brochure-`.
3. **List Files in Folder** → `vImages`.
4. **Log Message** — `Extracted {vImages.length} images`.
5. (Optional) **For Each** image → **Get File Info** to log size and format.

## Expected Outcome
`./docs/images/` contains one file per embedded image (e.g. `brochure-1.png`, `brochure-2.jpg`, …) preserving the original encoding where possible.

## Variables
| Name | Scope | Purpose |
|------|-------|---------|
| `vImages` | Message | Extracted image paths |

## Notes
Some PDFs store "images" as vector drawings — mention that only raster embedded images are extractable this way.
