/** Static pspec defaults: ports + icon for all namespaces used in templates.
 *  Mirrors what createMinimalPspec() + real pspec data would provide. */

export const PSPEC_DEFAULTS: Record<string, { inputs: number; outputs: number; icon: string }> = {
  // Core.Trigger
  'Core.Trigger.Inject':       { inputs: 0, outputs: 1, icon: 'play' },
  'Core.Trigger.Catch':        { inputs: 0, outputs: 1, icon: 'shield-alert' },

  // Core.Flow
  'Core.Flow.Stop':            { inputs: 1, outputs: 0, icon: 'circle-stop' },
  'Core.Flow.Comment':         { inputs: 0, outputs: 0, icon: 'message-square' },
  'Core.Flow.Label':           { inputs: 1, outputs: 1, icon: 'arrow-right' },
  'Core.Flow.GoTo':            { inputs: 1, outputs: 1, icon: 'arrow-right' },
  'Core.Flow.Begin':           { inputs: 0, outputs: 1, icon: 'arrow-right' },
  'Core.Flow.End':             { inputs: 1, outputs: 0, icon: 'arrow-right' },
  'Core.Flow.SubFlow':         { inputs: 1, outputs: 1, icon: 'git-branch' },
  'Core.Flow.ForkBranch':      { inputs: 1, outputs: 2, icon: 'git-fork' },

  // Core.Programming
  'Core.Programming.Function': { inputs: 1, outputs: 1, icon: 'braces' },
  'Core.Programming.Switch':   { inputs: 1, outputs: 3, icon: 'git-branch' },
  'Core.Programming.ForEach':  { inputs: 1, outputs: 2, icon: 'repeat' },
  'Core.Programming.Debug':    { inputs: 1, outputs: 1, icon: 'bug' },

  // Core.Net
  'Core.Net.HttpRequest':      { inputs: 1, outputs: 1, icon: 'globe' },
  'Core.Net.HttpIn':           { inputs: 0, outputs: 1, icon: 'globe' },
  'Core.Net.HttpOut':          { inputs: 1, outputs: 0, icon: 'globe' },
  'Core.Net.Download':         { inputs: 1, outputs: 1, icon: 'download' },

  // Core.Dialog
  'Core.Dialog.MessageBox':    { inputs: 1, outputs: 1, icon: 'message-square' },
  'Core.Dialog.InputBox':      { inputs: 1, outputs: 1, icon: 'text-cursor-input' },

  // Core.FileSystem
  'Core.FileSystem.ReadFile':  { inputs: 1, outputs: 1, icon: 'file' },
  'Core.FileSystem.WriteFile': { inputs: 1, outputs: 1, icon: 'file-pen' },
  'Core.FileSystem.List':      { inputs: 1, outputs: 1, icon: 'folder-open' },
  'Core.FileSystem.Delete':    { inputs: 1, outputs: 1, icon: 'trash-2' },
  'Core.FileSystem.Create':    { inputs: 1, outputs: 1, icon: 'file-plus' },
  'Core.FileSystem.PathExists':{ inputs: 1, outputs: 1, icon: 'file-search' },

  // Core.Browser
  'Core.Browser.Open':         { inputs: 1, outputs: 1, icon: 'chrome' },
  'Core.Browser.Close':        { inputs: 1, outputs: 1, icon: 'chrome' },
  'Core.Browser.OpenLink':     { inputs: 1, outputs: 1, icon: 'link' },
  'Core.Browser.GetValue':     { inputs: 1, outputs: 1, icon: 'search' },
  'Core.Browser.ClickElement': { inputs: 1, outputs: 1, icon: 'mouse-pointer' },
  'Core.Browser.TypeText':     { inputs: 1, outputs: 1, icon: 'keyboard' },
  'Core.Browser.WaitElement':  { inputs: 1, outputs: 1, icon: 'clock' },
  'Core.Browser.Screenshot':   { inputs: 1, outputs: 1, icon: 'camera' },
  'Core.Browser.RunScript':    { inputs: 1, outputs: 1, icon: 'code' },

  // Core.CSV
  'Core.CSV.ReadCSV':          { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.CSV.WriteCSV':         { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },

  // Core.Excel
  'Core.Excel.Open':           { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.Close':          { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.GetRange':       { inputs: 1, outputs: 1, icon: 'table' },
  'Core.Excel.SetRange':       { inputs: 1, outputs: 1, icon: 'table' },
  'Core.Excel.SwitchSheet':    { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Core.Excel.Create':         { inputs: 1, outputs: 1, icon: 'file-plus' },

  // Core.Clipboard
  'Core.Clipboard.Get':        { inputs: 1, outputs: 1, icon: 'clipboard' },
  'Core.Clipboard.Set':        { inputs: 1, outputs: 1, icon: 'clipboard-copy' },

  // Core.WaitGroup
  'Core.WaitGroup.Done':       { inputs: 1, outputs: 1, icon: 'check-circle' },

  // Robomotion.GoogleSheets
  'Robomotion.GoogleSheets.OpenSpreadsheet': { inputs: 1, outputs: 1, icon: 'file-spreadsheet' },
  'Robomotion.GoogleSheets.GetRange':        { inputs: 1, outputs: 1, icon: 'table' },
  'Robomotion.GoogleSheets.SetCellValue':    { inputs: 1, outputs: 1, icon: 'table' },

  // Robomotion.Monitoring
  'Robomotion.Monitoring.SSL': { inputs: 1, outputs: 1, icon: 'shield-check' },
  'Robomotion.Monitoring.DNS': { inputs: 1, outputs: 1, icon: 'server' },

  // Robomotion.ChatAssistant
  'Robomotion.ChatAssistant.ChatIn':  { inputs: 0, outputs: 1, icon: 'message-circle' },
  'Robomotion.ChatAssistant.ChatOut': { inputs: 1, outputs: 0, icon: 'message-circle' },
  'Robomotion.ChatAssistant.Text':    { inputs: 1, outputs: 1, icon: 'type' },

  // Robomotion.Agents
  'Robomotion.Agents.Agent.LLMAgent': { inputs: 1, outputs: 1, icon: 'bot' },

  // Robomotion.MemoryQueue
  'Robomotion.MemoryQueue.Create':  { inputs: 1, outputs: 1, icon: 'list' },
  'Robomotion.MemoryQueue.Dequeue': { inputs: 1, outputs: 1, icon: 'list-minus' },

  // Robomotion.Cryptography
  'Robomotion.Cryptography.HashFile': { inputs: 1, outputs: 1, icon: 'hash' },

  // Robomotion.SQLite
  'Robomotion.SQLite.Create':   { inputs: 1, outputs: 1, icon: 'database' },
  'Robomotion.SQLite.Connect':  { inputs: 1, outputs: 1, icon: 'database' },
  'Robomotion.SQLite.NonQuery': { inputs: 1, outputs: 1, icon: 'database' },
  'Robomotion.SQLite.Query':    { inputs: 1, outputs: 1, icon: 'database' },
  'Robomotion.SQLite.Insert':   { inputs: 1, outputs: 1, icon: 'database' },
};

export function getPspecDefaults(namespace: string): { inputs: number; outputs: number; icon: string } {
  return PSPEC_DEFAULTS[namespace] ?? { inputs: 1, outputs: 1, icon: 'package' };
}
