import React from 'react';
import { type NodeProps } from '@xyflow/react';

export interface CommentNodeData {
  label: string;
  commentText: string;
  color: string;
  width: number;
  height: number;
  [key: string]: unknown;
}

/** Simple markdown to HTML for comment nodes */
function renderMarkdown(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/^##### (.+)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/```[\s\S]*?```/g, (m) => `<pre>${m.slice(3, -3)}</pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export function CommentNode({ data }: NodeProps) {
  const { commentText, width, height } = data as unknown as CommentNodeData;

  return (
    <div
      className="node-comment"
      style={{
        width: width || 300,
        height: height || 150,
      }}
    >
      <div
        className="comment-content"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(commentText || '') }}
      />
    </div>
  );
}
