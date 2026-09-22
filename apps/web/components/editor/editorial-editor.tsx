'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Code,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface EditorialEditorProps {
  initialContent?: unknown;
  onChange?: (jsonContent: any, plainText: string) => void;
  onAutosave?: () => void;
  placeholder?: string;
  className?: string;
}

export function EditorialEditor({
  initialContent,
  onChange,
  onAutosave,
  placeholder = 'Mulai menuangkan gagasan, esai, atau catatan kritis di sini...',
  className,
}: EditorialEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = React.useState(0);
  const [readingTime, setReadingTime] = React.useState(1);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  // Convert initial content (TipTap JSON or string) to HTML for contenteditable
  const contentToHtml = React.useCallback((content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (content.type === 'doc' && Array.isArray(content.content)) {
      return content.content
        .map((node: any) => {
          if (node.type === 'paragraph') {
            const inner = (node.content || [])
              .map((c: any) => {
                let text = c.text || '';
                if (c.marks) {
                  c.marks.forEach((m: any) => {
                    if (m.type === 'bold') text = `<strong>${text}</strong>`;
                    if (m.type === 'italic') text = `<em>${text}</em>`;
                    if (m.type === 'link') text = `<a href="${m.attrs?.href}">${text}</a>`;
                    if (m.type === 'code') text = `<code>${text}</code>`;
                  });
                }
                return text;
              })
              .join('');
            return `<p>${inner || '<br>'}</p>`;
          }
          if (node.type === 'heading') {
            const level = node.attrs?.level || 2;
            const inner = (node.content || []).map((c: any) => c.text || '').join('');
            return `<h${level}>${inner}</h${level}>`;
          }
          if (node.type === 'blockquote') {
            const inner = (node.content || [])
              .map((c: any) => `<p>${(c.content || []).map((t: any) => t.text || '').join('')}</p>`)
              .join('');
            return `<blockquote>${inner}</blockquote>`;
          }
          if (node.type === 'bulletList') {
            const items = (node.content || [])
              .map((li: any) => `<li>${(li.content || []).map((p: any) => (p.content || []).map((t: any) => t.text || '').join('')).join('')}</li>`)
              .join('');
            return `<ul>${items}</ul>`;
          }
          if (node.type === 'orderedList') {
            const items = (node.content || [])
              .map((li: any) => `<li>${(li.content || []).map((p: any) => (p.content || []).map((t: any) => t.text || '').join('')).join('')}</li>`)
              .join('');
            return `<ol>${items}</ol>`;
          }
          if (node.type === 'horizontalRule') {
            return '<hr>';
          }
          return '';
        })
        .join('');
    }
    return '';
  }, []);

  // Convert HTML elements back into standard TipTap JSON
  const htmlToTipTapJson = React.useCallback((container: HTMLElement) => {
    const nodes: any[] = [];

    Array.from(container.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          nodes.push({
            type: 'paragraph',
            content: [{ type: 'text', text }],
          });
        }
        return;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();

        if (tag === 'p') {
          const content = extractInlineMarks(el);
          nodes.push({ type: 'paragraph', content });
        } else if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
          const level = parseInt(tag.charAt(1), 10);
          nodes.push({
            type: 'heading',
            attrs: { level },
            content: [{ type: 'text', text: el.textContent || '' }],
          });
        } else if (tag === 'blockquote') {
          nodes.push({
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: el.textContent || '' }],
              },
            ],
          });
        } else if (tag === 'ul') {
          const items = Array.from(el.querySelectorAll('li')).map((li) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: li.textContent || '' }],
              },
            ],
          }));
          nodes.push({ type: 'bulletList', content: items });
        } else if (tag === 'ol') {
          const items = Array.from(el.querySelectorAll('li')).map((li) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: li.textContent || '' }],
              },
            ],
          }));
          nodes.push({ type: 'orderedList', content: items });
        } else if (tag === 'hr') {
          nodes.push({ type: 'horizontalRule' });
        } else if (tag === 'pre') {
          nodes.push({
            type: 'codeBlock',
            content: [{ type: 'text', text: el.textContent || '' }],
          });
        } else {
          // Default fallback
          const text = el.textContent?.trim();
          if (text) {
            nodes.push({
              type: 'paragraph',
              content: [{ type: 'text', text }],
            });
          }
        }
      }
    });

    return {
      type: 'doc',
      content: nodes.length > 0 ? nodes : [{ type: 'paragraph', content: [] }],
    };
  }, []);

  function extractInlineMarks(element: HTMLElement): any[] {
    const inlineContent: any[] = [];

    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) {
          inlineContent.push({ type: 'text', text: node.textContent });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const text = el.textContent || '';
        const marks: any[] = [];

        if (tag === 'strong' || tag === 'b') marks.push({ type: 'bold' });
        if (tag === 'em' || tag === 'i') marks.push({ type: 'italic' });
        if (tag === 'a') marks.push({ type: 'link', attrs: { href: el.getAttribute('href') || '#' } });
        if (tag === 'code') marks.push({ type: 'code' });

        inlineContent.push({
          type: 'text',
          text,
          ...(marks.length > 0 ? { marks } : {}),
        });
      }
    });

    return inlineContent.length > 0 ? inlineContent : [{ type: 'text', text: '' }];
  }

  // Populate editor on initial mount
  React.useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = contentToHtml(initialContent);
      handleInput();
    }
  }, [initialContent, contentToHtml]);

  // Handle changes
  const handleInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));

    if (onChange) {
      const json = htmlToTipTapJson(editorRef.current);
      onChange(json, text.trim());
    }
  };

  // Execute formatting commands
  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Masukkan URL tautan:', 'https://');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Masukkan URL gambar ilustrasi:', 'https://');
    if (url) {
      execCmd('insertImage', url);
    }
  };

  // 15-second Autosave timer
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (wordCount > 0) {
        setIsSaving(true);
        if (onAutosave) {
          onAutosave();
        }
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [wordCount, onAutosave]);

  return (
    <div className={cn('border border-border bg-surface flex flex-col', className)}>
      {/* Sticky Top Toolbar */}
      <div className="sticky top-14 sm:top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border p-2 sm:px-4 flex flex-wrap items-center justify-between gap-2 select-none font-mono text-xs">
        {/* Formatting Actions */}
        <div className="flex flex-wrap items-center gap-1 text-foreground">
          <button
            type="button"
            onClick={() => execCmd('bold')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Tebal (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('italic')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Miring (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h2>')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Subjudul Bab (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Subjudul Bagian (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Kutipan Blok"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Daftar Poin"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Daftar Bernomor"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={handleInsertLink}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Sisipkan Tautan"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleInsertImage}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Sisipkan Gambar"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => execCmd('insertHorizontalRule')}
            className="p-1.5 hover:bg-surface-muted border border-transparent hover:border-border transition-colors"
            title="Garis Pemisah"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Right Stats & Autosave indicator */}
        <div className="flex items-center gap-4 text-muted text-[11px] uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span>{wordCount} Kata</span>
            <span>&bull;</span>
            <span>{readingTime} Menit Baca</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 border-l border-border pl-3">
            {isSaving ? (
              <span className="text-foreground animate-pulse flex items-center gap-1">
                <RotateCcw className="w-3 h-3 animate-spin" />
                <span>Menyimpan...</span>
              </span>
            ) : lastSaved ? (
              <span className="text-muted flex items-center gap-1 text-[10px]">
                <CheckCircle2 className="w-3 h-3 text-foreground" />
                <span>Draf {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Editor Canvas (Editorial Paper Area) */}
      <div className="p-6 sm:p-10 lg:p-14 min-h-[460px] bg-surface">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          suppressContentEditableWarning
          className="editorial-editor-content max-w-prose mx-auto outline-none font-serif text-lg sm:text-[19px] leading-[1.8] text-foreground/90 space-y-5 empty:before:content-[attr(data-placeholder)] empty:before:text-muted/60 empty:before:pointer-events-none"
          data-placeholder={placeholder}
        />
      </div>
    </div>
  );
}
