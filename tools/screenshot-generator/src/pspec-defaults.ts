/** Static pspec defaults: ports + icon for all Core.* namespaces used in templates.
 *  Icons sourced from robomotion-new-designer/src/collections/nodes/sections/*.ts
 *  Robomotion.* port data comes from downloaded pspecs at runtime. */

export const PSPEC_DEFAULTS: Record<string, { inputs: number; outputs: number; icon: string }> = {
  // Core.Trigger (trigger.ts)
  'Core.Trigger.Inject':       { inputs: 0, outputs: 1, icon: 'arrow-big-right-dash' },
  'Core.Trigger.Catch':        { inputs: 0, outputs: 1, icon: 'octagon-alert' },

  // Core.Flow (flow.ts)
  'Core.Flow.Stop':            { inputs: 1, outputs: 0, icon: 'circle-stop' },
  'Core.Flow.Comment':         { inputs: 0, outputs: 0, icon: 'message-circle' },
  'Core.Flow.Label':           { inputs: 0, outputs: 1, icon: 'arrow-right' },
  'Core.Flow.GoTo':            { inputs: 1, outputs: 0, icon: 'arrow-right' },
  'Core.Flow.Begin':           { inputs: 0, outputs: 1, icon: 'arrow-right' },
  'Core.Flow.End':             { inputs: 1, outputs: 0, icon: 'arrow-right' },
  'Core.Flow.SubFlow':         { inputs: 1, outputs: 1, icon: 'captions' },
  'Core.Flow.ForkBranch':      { inputs: 1, outputs: 2, icon: 'split' },

  // Core.Programming (programming.ts)
  'Core.Programming.Function': { inputs: 1, outputs: 1, icon: 'square-function' },
  'Core.Programming.Switch':   { inputs: 1, outputs: 3, icon: 'split' },
  'Core.Programming.ForEach':  { inputs: 1, outputs: 2, icon: 'refresh-ccw' },
  'Core.Programming.Debug':    { inputs: 1, outputs: 0, icon: 'bug' },

  // Core.Net (net.ts)
  'Core.Net.HttpRequest':      { inputs: 1, outputs: 1, icon: 'braces' },
  'Core.Net.HttpIn':           { inputs: 0, outputs: 1, icon: 'braces' },
  'Core.Net.HttpOut':          { inputs: 1, outputs: 0, icon: 'braces' },
  'Core.Net.Download':         { inputs: 1, outputs: 1, icon: 'download' },

  // Core.Dialog (dialog.ts)
  'Core.Dialog.MessageBox':    { inputs: 1, outputs: 1, icon: 'message-square' },
  'Core.Dialog.InputBox':      { inputs: 1, outputs: 1, icon: 'message-square-plus' },

  // Core.FileSystem (filesystem.ts)
  'Core.FileSystem.ReadFile':  { inputs: 1, outputs: 1, icon: 'file-output' },
  'Core.FileSystem.WriteFile': { inputs: 1, outputs: 1, icon: 'file-input' },
  'Core.FileSystem.List':      { inputs: 1, outputs: 1, icon: 'folder' },
  'Core.FileSystem.Delete':    { inputs: 1, outputs: 1, icon: 'folder-minus' },
  'Core.FileSystem.Create':    { inputs: 1, outputs: 1, icon: 'folder-plus' },
  'Core.FileSystem.PathExists':{ inputs: 1, outputs: 1, icon: 'folder-check' },

  // Core.Browser (browser.ts)
  'Core.Browser.Open':         { inputs: 1, outputs: 1, icon: 'globe' },
  'Core.Browser.Close':        { inputs: 1, outputs: 1, icon: 'x' },
  'Core.Browser.OpenLink':     { inputs: 1, outputs: 1, icon: 'link' },
  'Core.Browser.GetValue':     { inputs: 1, outputs: 1, icon: 'globe' },
  'Core.Browser.ClickElement': { inputs: 1, outputs: 1, icon: 'mouse-pointer-click' },
  'Core.Browser.TypeText':     { inputs: 1, outputs: 1, icon: 'type' },
  'Core.Browser.WaitElement':  { inputs: 1, outputs: 1, icon: 'hourglass' },
  'Core.Browser.Screenshot':   { inputs: 1, outputs: 1, icon: 'camera' },
  'Core.Browser.RunScript':    { inputs: 1, outputs: 1, icon: 'braces' },

  // Core.CSV (csv.ts)
  'Core.CSV.ReadCSV':          { inputs: 1, outputs: 1, icon: 'book-open-check' },
  'Core.CSV.WriteCSV':         { inputs: 1, outputs: 1, icon: 'notebook-pen' },

  // Core.Excel (excel.ts) — all use file-spreadsheet
  'Core.Excel.Open':           { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.Close':          { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.GetRange':       { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.SetRange':       { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.SwitchSheet':    { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.Create':         { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },

  // Core.Clipboard (clipboard.ts)
  'Core.Clipboard.Get':        { inputs: 1, outputs: 1, icon: 'clipboard' },
  'Core.Clipboard.Set':        { inputs: 1, outputs: 1, icon: 'clipboard' },

  // Core.WaitGroup (wait_group.ts)
  'Core.WaitGroup.Done':       { inputs: 1, outputs: 1, icon: 'alarm-clock-check' },
};

export function getPspecDefaults(namespace: string): { inputs: number; outputs: number; icon: string } {
  return PSPEC_DEFAULTS[namespace] ?? { inputs: 1, outputs: 1, icon: 'package' };
}
