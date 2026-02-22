import * as LucideIcons from 'lucide-react';
import React from 'react';

function toPascalCase(kebab: string): string {
  return kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

export function LucideIcon({ name, size = 16, color = 'white' }: { name: string; size?: number; color?: string }) {
  const pascalName = toPascalCase(name);
  const IconComp = (LucideIcons as any)[pascalName] as React.FC<any> | undefined;
  if (!IconComp) {
    const Fallback = (LucideIcons as any).Package as React.FC<any>;
    return <Fallback size={size} color={color} />;
  }
  return <IconComp size={size} color={color} />;
}
