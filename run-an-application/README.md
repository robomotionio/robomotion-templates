# Run an Application

Before automating any tasks on your desktop, you have to launch the appropriate application that will perform them. Robomotion allows you to launch virtually any application or file using the "Run Application" action.

## What Run an Application can do

- Resolve Desktop path — in a `Core.Programming.Function` node compute `vDesktopFolderPath = global.get('$Home$') + '/Desktop'`.
- Select File Dialog (single file, must-exist) titled `Select the app you would like to run..`, initial directory `vDesktopFolderPath`, top…
- Run Application — launch `vSelectedFile` with window style `Maximized`; capture `vAppProcessId`.

## Behind the scenes

- PA intentionally does **not** guard against the user clicking `Cancel` — if the dialog returns an empty path, `RunApplication` will raise an error. Replicate this: do not add a conditional gate unless the user asks for one.
- Window style `Maximized` on PA maps to the corresponding style flag on the chosen launch node (e.g. `ShowWindow SW_MAXIMIZE` on Windows).
