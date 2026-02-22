/**
 * Static namespace → color mapping for Core.* node namespaces.
 * Values sourced from robomotion-new-designer/src/collections/nodes/sections/*.ts
 * Robomotion.* colors come from downloaded pspecs at runtime.
 */

const COLOR_MAP: Record<string, string> = {
  // Core.Trigger (trigger.ts)
  'Core.Trigger.Inject': '#FDD835',
  'Core.Trigger.Catch': '#E64A19',

  // Core.Programming (programming.ts)
  'Core.Programming.Function': '#F27925',
  'Core.Programming.Switch': '#1DE9B6',
  'Core.Programming.ForEach': '#b9aeec',
  'Core.Programming.Debug': '#E6EE9C',

  // Core.Flow (flow.ts)
  'Core.Flow.Comment': '#fff740',
  'Core.Flow.Label': '#444',
  'Core.Flow.GoTo': '#444',
  'Core.Flow.Stop': '#fb2727',
  'Core.Flow.Begin': '#646bf5',
  'Core.Flow.End': '#646bf5',
  'Core.Flow.SubFlow': '#646bf5',
  'Core.Flow.ForkBranch': '#ed5c40',

  // Core.Dialog (dialog.ts) — section color: #4da5fb
  'Core.Dialog.MessageBox': '#4da5fb',
  'Core.Dialog.InputBox': '#4da5fb',

  // Core.FileSystem (filesystem.ts) — section color: #dbdfa0
  'Core.FileSystem.ReadFile': '#dbdfa0',
  'Core.FileSystem.WriteFile': '#dbdfa0',
  'Core.FileSystem.List': '#dbdfa0',
  'Core.FileSystem.Delete': '#dbdfa0',
  'Core.FileSystem.Create': '#dbdfa0',
  'Core.FileSystem.PathExists': '#dbdfa0',

  // Core.Browser (browser.ts) — section color: #c9d9ff
  'Core.Browser.Open': '#c9d9ff',
  'Core.Browser.Close': '#c9d9ff',
  'Core.Browser.OpenLink': '#c9d9ff',
  'Core.Browser.GetValue': '#c9d9ff',
  'Core.Browser.ClickElement': '#c9d9ff',
  'Core.Browser.TypeText': '#c9d9ff',
  'Core.Browser.WaitElement': '#c9d9ff',
  'Core.Browser.Screenshot': '#c9d9ff',
  'Core.Browser.RunScript': '#c9d9ff',

  // Core.Net (net.ts) — node color: #c9d9ff (section: #4da5fb)
  'Core.Net.HttpRequest': '#c9d9ff',
  'Core.Net.HttpIn': '#c9d9ff',
  'Core.Net.HttpOut': '#c9d9ff',
  'Core.Net.Download': '#c9d9ff',

  // Core.CSV (csv.ts) — section color: #0078DE
  'Core.CSV.ReadCSV': '#0078DE',
  'Core.CSV.WriteCSV': '#0078DE',

  // Core.Excel (excel.ts) — section color: #4CAF50
  'Core.Excel.Open': '#4CAF50',
  'Core.Excel.Close': '#4CAF50',
  'Core.Excel.GetRange': '#4CAF50',
  'Core.Excel.SetRange': '#4CAF50',
  'Core.Excel.SwitchSheet': '#4CAF50',
  'Core.Excel.Create': '#4CAF50',

  // Core.Clipboard (clipboard.ts) — section color: #00E5FF
  'Core.Clipboard.Get': '#00E5FF',
  'Core.Clipboard.Set': '#00E5FF',

  // Core.WaitGroup (wait_group.ts) — section color: #ed5c40
  'Core.WaitGroup.Done': '#ed5c40',
};

/** Fallback colors by package prefix (section-level defaults) */
const PREFIX_COLORS: Record<string, string> = {
  'Core.Trigger': '#FDD835',
  'Core.Programming': '#FF9800',
  'Core.Flow': '#607D8B',
  'Core.Dialog': '#4da5fb',
  'Core.FileSystem': '#dbdfa0',
  'Core.Browser': '#c9d9ff',
  'Core.Net': '#c9d9ff',
  'Core.CSV': '#0078DE',
  'Core.Excel': '#4CAF50',
  'Core.Clipboard': '#00E5FF',
  'Core.WaitGroup': '#ed5c40',
};

const DEFAULT_COLOR = '#CCCCCC';

/** Runtime pspec colors loaded from downloaded .pspec files */
let pspecColors: Record<string, string> = {};

/** Set pspec-derived colors at runtime (called by parser after downloading pspecs) */
export function setPspecColors(colors: Record<string, string>): void {
  pspecColors = colors;
}

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

  // Priority 2: Pspec-derived color (from downloaded .pspec files)
  if (pspecColors[namespace]) {
    return pspecColors[namespace];
  }

  // Priority 3: Exact namespace match (Core.* static map)
  if (COLOR_MAP[namespace]) {
    return COLOR_MAP[namespace];
  }

  // Priority 4: Package prefix match
  for (const [prefix, color] of Object.entries(PREFIX_COLORS)) {
    if (namespace.startsWith(prefix)) {
      return color;
    }
  }

  // Priority 5: Default
  return DEFAULT_COLOR;
}
