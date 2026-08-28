# Kestrel M2 — Materials Guide

Revision 4.2 · applies to Kestrel M2 and Kestrel M2 Pro

The Kestrel M2 ships with a 0.4 mm brass nozzle rated to 280 °C and a
spring-steel build plate with a textured PEI coating. The settings below are the
starting points our support team recommends. Fine-tune from there; do not start
from a slicer profile written for another machine.

## Recommended settings by filament

| Filament | Nozzle temperature | Bed temperature | Part cooling fan | Print speed | Enclosure |
|---|---|---|---|---|---|
| PLA        | 205 °C | 60 °C | 100 % | 60 mm/s | open |
| PETG       | 240 °C | 80 °C |  30 % | 45 mm/s | open |
| ABS        | 250 °C | 100 °C |  0 % | 40 mm/s | required |
| ASA        | 255 °C | 100 °C |  0 % | 40 mm/s | required |
| TPU 95A    | 225 °C | 45 °C |  60 % | 20 mm/s | open |
| PA6-CF     | 275 °C | 90 °C |  20 % | 35 mm/s | required |

PA6-CF is abrasive. Fit the hardened steel nozzle (part KM2-NOZ-H04) before
printing it; a brass nozzle will wear through in roughly forty hours of printing.

## Drying

PETG, TPU, PA6-CF and ASA absorb moisture from the air. Dry any spool that has
been open for more than a week before you load it into the printer:

| Filament | Dryer setting | Time |
|---|---|---|
| PETG    | 65 °C | 4 hours |
| TPU 95A | 55 °C | 6 hours |
| ASA     | 70 °C | 4 hours |
| PA6-CF  | 80 °C | 12 hours |

A wet spool shows itself as popping and hissing at the nozzle, stringing between
parts, and a rough matte surface where the finish should be glossy.

## Bed adhesion

The textured PEI plate needs no glue for PLA, PETG or TPU. Wash it with warm
water and dish soap when prints stop sticking, and wipe it with isopropyl
alcohol between prints. Never print directly onto a plate you have touched with
bare hands; skin oil is the single most common cause of a first layer lifting.

ABS and ASA need an enclosure and a thin coat of PVA glue stick on the plate.

## Storage

Keep opened spools in a sealed box with fresh desiccant. Silica gel that has
turned from orange to green is saturated and is doing nothing; dry it in the
oven at 110 °C for two hours or replace it.
