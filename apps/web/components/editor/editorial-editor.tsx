'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { adaptiveCompress, formatBytes } from '@/lib/image-compressor';
import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  Quote, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon,
  Minus, Code, AlignLeft, AlignCenter, AlignRight,
  RotateCcw, RotateCw, Eraser,
  CheckCircle2, Maximize2, Minimize2,
  UploadCloud, X, AlertCircle,
} from 'lucide-react';

interface EditorialEditorProps {
  initialContent?: unknown;
  onChange?: (jsonContent: any, plainText: string) => void;
  onAutosave?: () => void;
  placeholder?: string;
  className?: string;
  stickyTopOffset?: string;
}

// ─── INLINE IMAGE UPLOAD MODAL ────────────────────────────────────────────────
function InlineImageModal({
  onInsert,
  onClose,
}: {
  onInsert: (url: string, alt: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = React.useState<'upload' | 'url'>('upload');
  const [urlValue, setUrlValue] = React.useState('');
  const [altText, setAltText] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadLabel, setUploadLabel] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Berkas harus berupa gambar.');
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      setUploadLabel('Mengoptimasi gambar...');
      setUploadProgress(25);
      // Compress inline images to < 200KB, free aspect ratio
      const compressed = await adaptiveCompress(file, { targetBytes: 200 * 1024, aspectRatio: 'free' });
      setUploadLabel(`Mengoptimasi: ${formatBytes(compressed.originalSize)} → ${formatBytes(compressed.compressedSize)}`);
      setUploadProgress(60);

      // Upload
      setUploadLabel('Mengunggah...');
      const xhr = new XMLHttpRequest();
      const form = new FormData();
      form.append('file', compressed.file);
      form.append('folder', 'articles');

      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(60 + Math.round((e.loaded / e.total) * 40));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            if (data.url) { onInsert(data.url, altText.trim()); resolve(); }
            else reject(new Error(data.error || 'Gagal mendapat URL gambar.'));
          } else reject(new Error(`Unggah gagal (HTTP ${xhr.status})`));
        };
        xhr.onerror = () => reject(new Error('Gagal terhubung ke server.'));
        xhr.open('POST', '/api/upload');
        xhr.send(form);
      });
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah gambar.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-foreground/30 dark:bg-foreground/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-background border-t-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-hairline">
          <p className="font-mono text-xs font-bold uppercase tracking-wider">Sisipkan Gambar ke Naskah</p>
          <button onClick={onClose} className="p-2 text-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-hairline px-5">
          {(['upload', 'url'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2.5 px-3 font-mono text-[11px] uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                tab === t ? 'border-foreground text-foreground font-bold' : 'border-transparent text-muted hover:text-foreground'
              }`}
            >
              {t === 'upload' ? 'Unggah File' : 'URL'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-[11px] flex gap-2 items-center">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Alt text */}
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">
              Teks Alt / Keterangan Gambar (Opsional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Deskripsi singkat isi gambar..."
              className="w-full h-10 px-3 border border-border-hairline bg-surface font-sans text-sm sm:text-xs focus:border-foreground focus:outline-none"
            />
          </div>

          {tab === 'upload' ? (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              {isUploading ? (
                <div className="space-y-2">
                  <div className="h-2 bg-surface-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="font-mono text-[10px] text-muted animate-pulse">{uploadLabel}</p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border-hairline hover:border-foreground py-6 flex flex-col items-center gap-2 transition-colors"
                >
                  <UploadCloud className="w-7 h-7 text-muted stroke-1" />
                  <span className="font-mono text-[10px] uppercase text-muted">
                    Ketuk untuk pilih gambar · Otomatis &lt; 200 KB
                  </span>
                </button>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase tracking-wider text-muted font-bold">URL Gambar</label>
                <input
                  type="url"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 border border-border-hairline bg-surface font-mono text-xs focus:border-foreground focus:outline-none"
                />
              </div>
              <button
                type="button"
                disabled={!urlValue.trim()}
                onClick={() => { if (urlValue.trim()) onInsert(urlValue.trim(), altText.trim()); }}
                className="w-full h-11 bg-foreground text-background font-mono text-xs uppercase tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                Sisipkan Gambar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LINK MODAL ───────────────────────────────────────────────────────────────
function LinkModal({ onInsert, onClose }: { onInsert: (url: string, text: string) => void; onClose: () => void }) {
  const [url, setUrl] = React.useState('https://');
  const [text, setText] = React.useState('');
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-foreground/30 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-background border-t-2 sm:border-2 border-foreground rounded-t-2xl sm:rounded-none p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs font-bold uppercase tracking-wider">Sisipkan Tautan</p>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-muted font-bold">Teks Tautan (Opsional)</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Klik di sini untuk membaca..." className="w-full h-10 px-3 border border-border-hairline bg-surface font-sans text-sm sm:text-xs focus:border-foreground focus:outline-none" />
        </div>
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-muted font-bold">URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..." className="w-full h-10 px-3 border border-border-hairline bg-surface font-mono text-xs focus:border-foreground focus:outline-none" />
        </div>
        <button
          type="button"
          disabled={!url.trim() || url === 'https://'}
          onClick={() => onInsert(url, text)}
          className="w-full h-11 bg-foreground text-background font-mono text-xs uppercase tracking-wider disabled:opacity-40"
        >
          Sisipkan Tautan
        </button>
      </div>
    </div>
  );
}

// ─── MAIN EDITOR ──────────────────────────────────────────────────────────────
export function EditorialEditor({
  initialContent,
  onChange,
  onAutosave,
  placeholder = 'Mulai menuangkan gagasan, esai, atau catatan kritis di sini...',
  className,
  stickyTopOffset = 'sticky top-[100px]',
}: EditorialEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = React.useState(0);
  const [readingTime, setReadingTime] = React.useState(1);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [showImageModal, setShowImageModal] = React.useState(false);
  const [showLinkModal, setShowLinkModal] = React.useState(false);

  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    h1: false,
    h2: false,
    h3: false,
    quote: false,
    code: false,
    ul: false,
    ol: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
  });

  // Save selection before modal opens (lost when modal steals focus)
  const savedRange = React.useRef<Range | null>(null);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedRange.current) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const renderNodeMarks = (node: any): string => {
    return (node.content || []).map((c: any) => {
      let text = c.text || '';
      if (c.marks) c.marks.forEach((m: any) => {
        if (m.type === 'bold') text = `<strong>${text}</strong>`;
        if (m.type === 'italic') text = `<em>${text}</em>`;
        if (m.type === 'underline') text = `<u>${text}</u>`;
        if (m.type === 'strike') text = `<s>${text}</s>`;
        if (m.type === 'link') text = `<a href="${m.attrs?.href}">${text}</a>`;
        if (m.type === 'code') text = `<code>${text}</code>`;
      });
      return text;
    }).join('');
  };

  const contentToHtml = React.useCallback((content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (content.type === 'doc' && Array.isArray(content.content)) {
      return content.content.map((node: any) => {
        if (node.type === 'paragraph') {
          const inner = renderNodeMarks(node);
          return `<p>${inner || '<br>'}</p>`;
        }
        if (node.type === 'heading') {
          const level = node.attrs?.level || 2;
          const inner = (node.content || []).map((c: any) => c.text || '').join('');
          return `<h${level}>${inner}</h${level}>`;
        }
        if (node.type === 'blockquote') {
          const inner = (node.content || []).map((c: any) => {
            const pInner = renderNodeMarks(c);
            return `<p>${pInner || '<br>'}</p>`;
          }).join('');
          return `<blockquote>${inner || '<p><br></p>'}</blockquote>`;
        }
        if (node.type === 'bulletList') {
          const items = (node.content || []).map((li: any) => `<li>${(li.content || []).map((p: any) => (p.content || []).map((t: any) => t.text || '').join('')).join('')}</li>`).join('');
          return `<ul>${items}</ul>`;
        }
        if (node.type === 'orderedList') {
          const items = (node.content || []).map((li: any) => `<li>${(li.content || []).map((p: any) => (p.content || []).map((t: any) => t.text || '').join('')).join('')}</li>`).join('');
          return `<ol>${items}</ol>`;
        }
        if (node.type === 'horizontalRule') return '<hr>';
        if (node.type === 'image') return `<img src="${node.attrs?.src || ''}" alt="${node.attrs?.alt || ''}" class="editor-inline-image" />`;
        return '';
      }).join('');
    }
    return '';
  }, []);

  const htmlToTipTapJson = React.useCallback((container: HTMLElement) => {
    const nodes: any[] = [];
    Array.from(container.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) nodes.push({ type: 'paragraph', content: [{ type: 'text', text }] });
        return;
      }
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === 'p') nodes.push({ type: 'paragraph', content: extractInlineMarks(el) });
        else if (['h1','h2','h3','h4'].includes(tag)) nodes.push({ type: 'heading', attrs: { level: parseInt(tag.charAt(1), 10) }, content: [{ type: 'text', text: el.textContent || '' }] });
        else if (tag === 'blockquote') {
          const pChildren = Array.from(el.querySelectorAll('p'));
          if (pChildren.length > 0) {
            nodes.push({
              type: 'blockquote',
              content: pChildren.map((p) => ({
                type: 'paragraph',
                content: extractInlineMarks(p),
              })),
            });
          } else {
            nodes.push({
              type: 'blockquote',
              content: [{ type: 'paragraph', content: extractInlineMarks(el) }],
            });
          }
        }
        else if (tag === 'ul') {
          const items = Array.from(el.querySelectorAll('li')).map((li) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }] }));
          nodes.push({ type: 'bulletList', content: items });
        }
        else if (tag === 'ol') {
          const items = Array.from(el.querySelectorAll('li')).map((li) => ({ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: li.textContent || '' }] }] }));
          nodes.push({ type: 'orderedList', content: items });
        }
        else if (tag === 'hr') nodes.push({ type: 'horizontalRule' });
        else if (tag === 'pre' || tag === 'code') nodes.push({ type: 'codeBlock', content: [{ type: 'text', text: el.textContent || '' }] });
        else if (tag === 'img') nodes.push({ type: 'image', attrs: { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '' } });
        else { const text = el.textContent?.trim(); if (text) nodes.push({ type: 'paragraph', content: [{ type: 'text', text }] }); }
      }
    });
    return { type: 'doc', content: nodes.length > 0 ? nodes : [{ type: 'paragraph', content: [] }] };
  }, []);

  function extractInlineMarks(element: HTMLElement): any[] {
    const result: any[] = [];
    Array.from(element.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) result.push({ type: 'text', text: node.textContent });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const text = el.textContent || '';
        const marks: any[] = [];
        if (tag === 'strong' || tag === 'b') marks.push({ type: 'bold' });
        if (tag === 'em' || tag === 'i') marks.push({ type: 'italic' });
        if (tag === 'u') marks.push({ type: 'underline' });
        if (tag === 's' || tag === 'del' || tag === 'strike') marks.push({ type: 'strike' });
        if (tag === 'a') marks.push({ type: 'link', attrs: { href: el.getAttribute('href') || '#' } });
        if (tag === 'code') marks.push({ type: 'code' });
        if (tag === 'img') { result.push({ type: 'image', attrs: { src: el.getAttribute('src') || '', alt: el.getAttribute('alt') || '' } }); return; }
        result.push({ type: 'text', text, ...(marks.length > 0 ? { marks } : {}) });
      }
    });
    return result.length > 0 ? result : [{ type: 'text', text: '' }];
  }

  React.useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = contentToHtml(initialContent);
      handleInput();
    }
  }, [initialContent, contentToHtml]); // eslint-disable-line

  const handleInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setReadingTime(Math.max(1, Math.ceil(words / 200)));
    if (onChange) onChange(htmlToTipTapJson(editorRef.current), text.trim());
  };

  // Paste cleaner — strip Word/GDocs inline styles, keep semantic formatting
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const plain = e.clipboardData.getData('text/plain');
    if (html) {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      // Remove all style attrs, class attrs, data-* attrs
      tmp.querySelectorAll('*').forEach((el) => {
        el.removeAttribute('style');
        el.removeAttribute('class');
        el.removeAttribute('id');
        Array.from(el.attributes)
          .filter((a) => a.name.startsWith('data-'))
          .forEach((a) => el.removeAttribute(a.name));
        // Remove span wrappers (used heavily by GDocs)
        if (el.tagName.toLowerCase() === 'span') {
          const parent = el.parentNode;
          while (el.firstChild) parent?.insertBefore(el.firstChild, el);
          parent?.removeChild(el);
        }
      });
      document.execCommand('insertHTML', false, tmp.innerHTML);
    } else {
      document.execCommand('insertText', false, plain);
    }
    handleInput();
  };

  const getActiveBlockTag = (): string => {
    if (typeof window === 'undefined') return 'p';
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return 'p';
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    while (node && node !== editorRef.current) {
      const tag = (node as HTMLElement).tagName?.toLowerCase();
      if (['h1', 'h2', 'h3', 'blockquote', 'pre', 'ul', 'ol'].includes(tag)) {
        return tag;
      }
      node = node.parentNode;
    }
    return 'p';
  };

  const updateActiveFormats = React.useCallback(() => {
    if (typeof window === 'undefined' || !editorRef.current) return;
    try {
      const currentBlock = getActiveBlockTag();
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strike: document.queryCommandState('strikeThrough'),
        h1: currentBlock === 'h1',
        h2: currentBlock === 'h2',
        h3: currentBlock === 'h3',
        quote: currentBlock === 'blockquote',
        code: currentBlock === 'pre',
        ul: currentBlock === 'ul' || document.queryCommandState('insertUnorderedList'),
        ol: currentBlock === 'ol' || document.queryCommandState('insertOrderedList'),
        alignLeft: document.queryCommandState('justifyLeft'),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
      });
    } catch {
      // Ignore if document not focused
    }
  }, []);

  React.useEffect(() => {
    const handleSelectionChange = () => {
      updateActiveFormats();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [updateActiveFormats]);

  const toggleBlock = (tag: 'h1' | 'h2' | 'h3' | 'pre') => {
    editorRef.current?.focus();
    const currentBlock = getActiveBlockTag();

    if (currentBlock === tag) {
      try {
        document.execCommand('formatBlock', false, '<p>');
      } catch {
        document.execCommand('formatBlock', false, 'p');
      }
    } else {
      try {
        document.execCommand('formatBlock', false, `<${tag}>`);
      } catch {
        try {
          document.execCommand('formatBlock', false, tag);
        } catch {
          document.execCommand('formatBlock', false, `<${tag.toUpperCase()}>`);
        }
      }
    }
    handleInput();
    updateActiveFormats();
  };

  const toggleBlockquote = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

    // Check if currently inside a blockquote
    let bq: HTMLElement | null = null;
    let curr: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    if (curr.nodeType === Node.TEXT_NODE) curr = curr.parentNode;
    while (curr && curr !== editorRef.current) {
      if ((curr as HTMLElement).tagName?.toLowerCase() === 'blockquote') {
        bq = curr as HTMLElement;
        break;
      }
      curr = curr.parentNode;
    }

    if (bq) {
      // UNWRAP blockquote: turn it back into normal paragraphs!
      const parent = bq.parentNode;
      if (parent) {
        const pList = Array.from(bq.querySelectorAll('p'));
        const fragment = document.createDocumentFragment();
        let lastP: HTMLElement | null = null;
        if (pList.length > 0) {
          pList.forEach((p) => {
            const newP = document.createElement('p');
            newP.innerHTML = p.innerHTML || '<br>';
            fragment.appendChild(newP);
            lastP = newP;
          });
        } else {
          const newP = document.createElement('p');
          newP.innerHTML = bq.innerHTML || '<br>';
          fragment.appendChild(newP);
          lastP = newP;
        }
        parent.replaceChild(fragment, bq);
        if (lastP) {
          const newRange = document.createRange();
          newRange.selectNodeContents(lastP);
          newRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      }
    } else {
      // WRAP in blockquote!
      try {
        document.execCommand('formatBlock', false, '<blockquote>');
      } catch {
        try {
          document.execCommand('formatBlock', false, 'blockquote');
        } catch {
          document.execCommand('formatBlock', false, '<BLOCKQUOTE>');
        }
      }
    }
    handleInput();
    updateActiveFormats();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

      const range = sel.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

      // Check if inside a blockquote
      let bq: HTMLElement | null = null;
      let curr: Node | null = node;
      while (curr && curr !== editorRef.current) {
        if ((curr as HTMLElement).tagName?.toLowerCase() === 'blockquote') {
          bq = curr as HTMLElement;
          break;
        }
        curr = curr.parentNode;
      }

      if (bq) {
        // Check if the current line/block inside the quote is empty
        const lineText = node?.textContent?.replace(/\u200B/g, '').trim() || '';
        if (!lineText) {
          // Double enter or enter on empty line inside blockquote: break out of the quote into normal paragraph!
          e.preventDefault();
          const newP = document.createElement('p');
          newP.innerHTML = '<br>';

          // If blockquote is entirely empty, remove blockquote and just leave the new paragraph
          const bqText = bq.textContent?.replace(/\u200B/g, '').trim() || '';
          if (!bqText) {
            bq.parentNode?.replaceChild(newP, bq);
          } else {
            // Remove the empty paragraph inside blockquote
            if (node && node !== bq && bq.contains(node)) {
              node.parentNode?.removeChild(node);
            }

            // Insert new paragraph right after the blockquote
            if (bq.nextSibling) {
              bq.parentNode?.insertBefore(newP, bq.nextSibling);
            } else {
              bq.parentNode?.appendChild(newP);
            }
          }

          // Move cursor into the new paragraph
          const newRange = document.createRange();
          newRange.selectNodeContents(newP);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);

          handleInput();
          updateActiveFormats();
          return;
        }
      }
    }

    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;

      const range = sel.getRangeAt(0);
      let node: Node | null = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;

      let bq: HTMLElement | null = null;
      let curr: Node | null = node;
      while (curr && curr !== editorRef.current) {
        if ((curr as HTMLElement).tagName?.toLowerCase() === 'blockquote') {
          bq = curr as HTMLElement;
          break;
        }
        curr = curr.parentNode;
      }

      // If empty blockquote, backspace converts it back to a standard paragraph
      if (bq) {
        const bqText = bq.textContent?.replace(/\u200B/g, '').trim() || '';
        if (!bqText) {
          e.preventDefault();
          const newP = document.createElement('p');
          newP.innerHTML = '<br>';
          bq.parentNode?.replaceChild(newP, bq);

          const newRange = document.createRange();
          newRange.selectNodeContents(newP);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);

          handleInput();
          updateActiveFormats();
          return;
        }
      }
    }
  };

  const toggleList = (type: 'ul' | 'ol') => {
    editorRef.current?.focus();
    if (type === 'ul') {
      document.execCommand('insertUnorderedList', false);
    } else {
      document.execCommand('insertOrderedList', false);
    }
    handleInput();
    updateActiveFormats();
  };

  const execCmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
    updateActiveFormats();
  };

  const handleInsertLink = () => {
    saveSelection();
    setShowLinkModal(true);
  };

  const doInsertLink = (url: string, text: string) => {
    setShowLinkModal(false);
    restoreSelection();
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      // Wrap selection
      execCmd('createLink', url);
    } else {
      // Insert new link text
      const linkHtml = `<a href="${url}">${text || url}</a>`;
      execCmd('insertHTML', linkHtml);
    }
  };

  const handleInsertImage = () => {
    saveSelection();
    setShowImageModal(true);
  };

  const doInsertImage = (url: string, alt: string) => {
    setShowImageModal(false);
    restoreSelection();
    editorRef.current?.focus();

    const cleanAlt = alt.trim();
    const nextPId = 'after-img-' + Math.random().toString(36).substring(2, 9);
    const imgHtml = `<figure class="editor-image-figure" contenteditable="false"><img src="${url}" alt="${cleanAlt}" class="editor-inline-image" />${cleanAlt ? `<figcaption contenteditable="true">${cleanAlt}</figcaption>` : ''}</figure><p id="${nextPId}"><br></p>`;

    execCmd('insertHTML', imgHtml);

    // Explicitly place the caret in the fresh empty paragraph below the image
    setTimeout(() => {
      const nextP = document.getElementById(nextPId);
      if (nextP && editorRef.current) {
        nextP.removeAttribute('id');
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(nextP);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
      handleInput();
      updateActiveFormats();
    }, 20);
  };

  // 15-second autosave
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (wordCount > 0) {
        setIsSaving(true);
        onAutosave?.();
        setLastSaved(new Date());
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [wordCount, onAutosave]);

  // Focus mode: hide dashboard sidebar by toggling body class
  React.useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('editor-focus-mode');
    } else {
      document.body.classList.remove('editor-focus-mode');
    }
    return () => document.body.classList.remove('editor-focus-mode');
  }, [isFocusMode]);

  // ── Toolbar button helper ────────────────────────────────────────────────────
  const TB = ({
    onClick, title, children, active,
  }: {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 border border-transparent transition-colors shrink-0',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'text-foreground hover:bg-surface-muted hover:border-border'
      )}
    >
      {children}
    </button>
  );

  const Sep = () => <span className="w-px h-5 bg-border-hairline mx-0.5 shrink-0" />;

  return (
    <>
      {/* ── Modals ── */}
      {showImageModal && (
        <InlineImageModal onInsert={doInsertImage} onClose={() => setShowImageModal(false)} />
      )}
      {showLinkModal && (
        <LinkModal onInsert={doInsertLink} onClose={() => setShowLinkModal(false)} />
      )}

      <div className={cn('border border-border bg-surface flex flex-col relative', isFocusMode && 'fixed inset-0 z-[100] border-0', className)}>
        {/* ── Sticky Toolbar ── */}
        <div
          className={cn(
            'z-20 bg-background/98 backdrop-blur-md border-b border-border select-none shadow-[0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.25)] transition-shadow',
            isFocusMode ? 'sticky top-0' : stickyTopOffset
          )}
        >
          {/* Main toolbar row — horizontally scrollable on mobile */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-2 py-1 overflow-x-auto no-scrollbar touch-pan-x">
            <div className="flex items-center gap-0.5 flex-nowrap min-w-max">
              {/* Text style */}
              <TB onClick={() => execCmd('bold')} active={activeFormats.bold} title="Tebal (Ctrl+B)"><Bold className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('italic')} active={activeFormats.italic} title="Miring (Ctrl+I)"><Italic className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('underline')} active={activeFormats.underline} title="Garis Bawah (Ctrl+U)"><Underline className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('strikeThrough')} active={activeFormats.strike} title="Coret"><Strikethrough className="w-4 h-4" /></TB>

              <Sep />

              {/* Headings */}
              <TB onClick={() => toggleBlock('h1')} active={activeFormats.h1} title="Judul Bab (H1)"><Heading1 className="w-4 h-4" /></TB>
              <TB onClick={() => toggleBlock('h2')} active={activeFormats.h2} title="Subjudul (H2)"><Heading2 className="w-4 h-4" /></TB>
              <TB onClick={() => toggleBlock('h3')} active={activeFormats.h3} title="Sub-Bagian (H3)"><Heading3 className="w-4 h-4" /></TB>

              <Sep />

              {/* Block */}
              <TB onClick={toggleBlockquote} active={activeFormats.quote} title="Kutipan Blok"><Quote className="w-4 h-4" /></TB>
              <TB onClick={() => toggleList('ul')} active={activeFormats.ul} title="Daftar Poin"><List className="w-4 h-4" /></TB>
              <TB onClick={() => toggleList('ol')} active={activeFormats.ol} title="Daftar Bernomor"><ListOrdered className="w-4 h-4" /></TB>

              <Sep />

              {/* Align */}
              <TB onClick={() => execCmd('justifyLeft')} active={activeFormats.alignLeft} title="Rata Kiri"><AlignLeft className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('justifyCenter')} active={activeFormats.alignCenter} title="Rata Tengah"><AlignCenter className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('justifyRight')} active={activeFormats.alignRight} title="Rata Kanan"><AlignRight className="w-4 h-4" /></TB>

              <Sep />

              {/* Insert */}
              <TB onClick={handleInsertLink} title="Sisipkan Tautan (Ctrl+K)"><LinkIcon className="w-4 h-4" /></TB>
              <TB onClick={handleInsertImage} title="Sisipkan Gambar (Upload/URL)"><ImageIcon className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('insertHorizontalRule')} title="Garis Pemisah"><Minus className="w-4 h-4" /></TB>
              <TB onClick={() => toggleBlock('pre')} active={activeFormats.code} title="Blok Kode"><Code className="w-4 h-4" /></TB>

              <Sep />

              {/* History + Clean */}
              <TB onClick={() => execCmd('undo')} title="Undo (Ctrl+Z)"><RotateCcw className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('redo')} title="Redo (Ctrl+Y)"><RotateCw className="w-4 h-4" /></TB>
              <TB onClick={() => execCmd('removeFormat')} title="Hapus Pemformatan"><Eraser className="w-4 h-4" /></TB>
            </div>

            {/* Right: stats + focus mode */}
            <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-border-hairline">
              <span className="font-mono text-[10px] text-muted uppercase whitespace-nowrap hidden sm:block">
                {wordCount} Kata · {readingTime} Mnt
              </span>
              {isSaving && (
                <span className="font-mono text-[10px] text-foreground animate-pulse hidden sm:block">Menyimpan...</span>
              )}
              {!isSaving && lastSaved && (
                <span className="font-mono text-[10px] text-muted hidden sm:flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setIsFocusMode(!isFocusMode); }}
                title={isFocusMode ? 'Keluar Focus Mode' : 'Focus Mode — tulis tanpa gangguan'}
                className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center text-muted hover:text-foreground border border-transparent hover:border-border transition-colors"
              >
                {isFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Editor Canvas ── */}
        <div className={cn(isFocusMode ? 'flex-1 overflow-y-auto p-6 sm:p-16 max-w-3xl mx-auto w-full' : 'p-4 sm:p-10')}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            suppressContentEditableWarning
            className="editorial-editor-content min-h-[400px] sm:min-h-[520px] outline-none font-serif text-base sm:text-[18px] text-foreground/90 empty:before:content-[attr(data-placeholder)] empty:before:text-muted/40 empty:before:pointer-events-none"
            data-placeholder={placeholder}
          />
        </div>
      </div>

      {/* Focus mode exit overlay hint */}
      {isFocusMode && (
        <div className="fixed bottom-6 right-6 z-[110]">
          <button
            type="button"
            onClick={() => setIsFocusMode(false)}
            className="h-10 px-4 bg-foreground text-background font-mono text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg hover:opacity-90"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            Keluar Focus Mode
          </button>
        </div>
      )}
    </>
  );
}
