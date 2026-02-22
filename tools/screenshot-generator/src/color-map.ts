/**
 * Static namespace → color mapping for all known Robomotion node namespaces.
 * Priority: designer nodeColors > this map > package prefix fallback > default gray.
 */

const COLOR_MAP: Record<string, string> = {
  // Core.Trigger
  'Core.Trigger.Inject': '#FFC107',
  'Core.Trigger.Catch': '#FF5722',

  // Core.Programming
  'Core.Programming.Function': '#FF9800',
  'Core.Programming.Switch': '#FF9800',
  'Core.Programming.ForEach': '#4CAF50',
  'Core.Programming.Debug': '#FF9800',

  // Core.Flow
  'Core.Flow.Comment': '#6B7280',
  'Core.Flow.Label': '#6610F2',
  'Core.Flow.GoTo': '#6610F2',
  'Core.Flow.Stop': '#DC3545',
  'Core.Flow.Begin': '#4CAF50',
  'Core.Flow.End': '#DC3545',
  'Core.Flow.SubFlow': '#9C27B0',
  'Core.Flow.ForkBranch': '#2196F3',

  // Core.Dialog
  'Core.Dialog.MessageBox': '#607D8B',
  'Core.Dialog.InputBox': '#607D8B',

  // Core.FileSystem
  'Core.FileSystem.ReadFile': '#795548',
  'Core.FileSystem.WriteFile': '#795548',
  'Core.FileSystem.List': '#795548',
  'Core.FileSystem.Delete': '#795548',
  'Core.FileSystem.Create': '#795548',
  'Core.FileSystem.PathExists': '#795548',

  // Core.Browser
  'Core.Browser.Open': '#2196F3',
  'Core.Browser.Close': '#2196F3',
  'Core.Browser.OpenLink': '#2196F3',
  'Core.Browser.GetValue': '#2196F3',
  'Core.Browser.ClickElement': '#2196F3',
  'Core.Browser.TypeText': '#2196F3',
  'Core.Browser.WaitElement': '#2196F3',
  'Core.Browser.Screenshot': '#2196F3',
  'Core.Browser.RunScript': '#2196F3',

  // Core.Net
  'Core.Net.HttpRequest': '#00BCD4',
  'Core.Net.HttpIn': '#00BCD4',
  'Core.Net.HttpOut': '#00BCD4',
  'Core.Net.Download': '#00BCD4',

  // Core.CSV
  'Core.CSV.ReadCSV': '#8BC34A',
  'Core.CSV.WriteCSV': '#8BC34A',

  // Core.Excel
  'Core.Excel.Open': '#217346',
  'Core.Excel.Close': '#217346',
  'Core.Excel.GetRange': '#217346',
  'Core.Excel.SetRange': '#217346',
  'Core.Excel.SwitchSheet': '#217346',
  'Core.Excel.Create': '#217346',

  // Core.Clipboard
  'Core.Clipboard.Get': '#9E9E9E',
  'Core.Clipboard.Set': '#9E9E9E',

  // Core.WaitGroup
  'Core.WaitGroup.Done': '#607D8B',

  // Robomotion.GoogleSheets
  'Robomotion.GoogleSheets.OpenSpreadsheet': '#28A745',
  'Robomotion.GoogleSheets.GetRange': '#28A745',
  'Robomotion.GoogleSheets.SetCellValue': '#28A745',

  // Robomotion.Monitoring
  'Robomotion.Monitoring.SSL': '#2196F3',
  'Robomotion.Monitoring.DNS': '#2196F3',

  // Robomotion.ChatAssistant
  'Robomotion.ChatAssistant.ChatIn': '#E91E63',
  'Robomotion.ChatAssistant.ChatOut': '#E91E63',
  'Robomotion.ChatAssistant.Text': '#E91E63',

  // Robomotion.Agents
  'Robomotion.Agents.Agent.LLMAgent': '#9C27B0',

  // Robomotion.MemoryQueue
  'Robomotion.MemoryQueue.Create': '#FF5722',
  'Robomotion.MemoryQueue.Dequeue': '#FF5722',

  // Robomotion.Cryptography
  'Robomotion.Cryptography.HashFile': '#607D8B',

  // Robomotion.SQLite
  'Robomotion.SQLite.Create': '#3F51B5',
  'Robomotion.SQLite.Connect': '#3F51B5',
  'Robomotion.SQLite.NonQuery': '#3F51B5',
  'Robomotion.SQLite.Query': '#3F51B5',
  'Robomotion.SQLite.Insert': '#3F51B5',
};

/** Fallback colors by package prefix */
const PREFIX_COLORS: Record<string, string> = {
  'Core.Trigger': '#FFC107',
  'Core.Programming': '#FF9800',
  'Core.Flow': '#607D8B',
  'Core.Dialog': '#607D8B',
  'Core.FileSystem': '#795548',
  'Core.Browser': '#2196F3',
  'Core.Net': '#00BCD4',
  'Core.CSV': '#8BC34A',
  'Core.Excel': '#217346',
  'Core.Clipboard': '#9E9E9E',
  'Core.WaitGroup': '#607D8B',
  'Robomotion.GoogleSheets': '#28A745',
  'Robomotion.Monitoring': '#2196F3',
  'Robomotion.ChatAssistant': '#E91E63',
  'Robomotion.Agents': '#9C27B0',
  'Robomotion.MemoryQueue': '#FF5722',
  'Robomotion.Cryptography': '#607D8B',
  'Robomotion.SQLite': '#3F51B5',
};

const DEFAULT_COLOR = '#CCCCCC';

export function resolveColor(
  nodeId: string,
  namespace: string,
  designerColors: Record<string, string>
): string {
  // Priority 1: Designer-specified color (skip HSL comment vars — those are handled by comment nodes)
  const designerColor = designerColors[nodeId];
  if (designerColor && !designerColor.startsWith('hsl(')) {
    return designerColor;
  }

  // Priority 2: Exact namespace match
  if (COLOR_MAP[namespace]) {
    return COLOR_MAP[namespace];
  }

  // Priority 3: Package prefix match
  for (const [prefix, color] of Object.entries(PREFIX_COLORS)) {
    if (namespace.startsWith(prefix)) {
      return color;
    }
  }

  // Priority 4: Default
  return DEFAULT_COLOR;
}
