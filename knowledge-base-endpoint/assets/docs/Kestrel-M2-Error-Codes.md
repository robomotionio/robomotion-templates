# Kestrel M2 — Error Codes

Revision 4.2 · every code the printer can show on its front panel

When the printer stops with a code, write the code down before you power it off.
The panel clears the code on restart and the log keeps only the last ten.

## E-11 — Filament runout

The runout sensor no longer sees filament. The print is paused and the hot end
is held at temperature for thirty minutes, then cooled. Load a new spool and
press Resume. If the sensor reports runout with filament loaded, the lever
inside the sensor is stuck; open it and clear the dust.

## E-14 — Filament jam

The extruder turned but the filament did not move. Usually a clogged nozzle or a
partial blockage in the heat break. Heat the nozzle to 240 °C, push the filament
through by hand, and if it will not move, cold-pull with a length of nylon.

## E-19 — Bed levelling failed

The probe did not find the plate at one or more points. Check that the plate is
seated flat on the magnets and that nothing is stuck to the underside. A single
point failing at the front left is almost always a loose probe cable.

## E-23 — Heated bed not reaching temperature

The bed is heating too slowly and the firmware has given up waiting. Expect this
in a cold room with the bed set to 100 °C for ABS. Fit the magnetic insulation
mat (part KM2-INS-01) under the plate, or lower the bed temperature.

## E-27 — Thermal runaway, hot end

**Stop using the printer until this is resolved.** The hot end asked for heat
and the thermistor did not report the temperature rising. Either the heater
cartridge or the thermistor has worked loose in the heater block. Power the
printer off at the wall, let it cool completely, and reseat both. Do not disable
the thermal runaway protection to get a print finished; it is the only thing
standing between a loose thermistor and a fire.

## E-31 — Motion stalled

A stepper skipped enough steps for the driver to notice. Something is in the way
of the gantry, a belt is too loose, or a linear rail needs cleaning and oiling.

## E-42 — Firmware and mainboard mismatch

The firmware image on the card was built for a different mainboard revision.
Check the revision printed beside the SD slot and download the matching build.
The printer will keep refusing to start until the correct image is installed.
