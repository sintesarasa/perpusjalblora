import * as React from 'react';
import { cn } from '@/lib/utils';

interface TipTapMark {
  type: string;
  attrs?: Record<string, any>;
}

interface TipTapNode {
  type: string;
  attrs?: Record<string, any>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
}

interface RichTextRendererProps {
  content: unknown;
  className?: string;
  withDropCap?: boolean;
}

/**
 * Fast, secure zero-dependency HTML sanitizer for editorial rich text rendering
 * Strips executable scripts, event handlers, and dangerous tags
 */
function sanitizeEditorialHtml(raw: string): string {
  if (!raw) return '';

  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?(iframe|object|embed|applet|form|input|button|select|textarea|base|meta|link)\b[^>]*>/gi, '')
    .replace(/\s+(href|src)\s*=\s*["']\s*(javascript|vbscript|data):[^"']*["']/gi, ' $1="#"')
    .replace(/\s+on\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, '');
}

export function RichTextRenderer({
  content,
  className,
  withDropCap = true,
}: RichTextRendererProps) {
  if (!content) {
    return null;
  }

  // If content is string (HTML or plain text)
  if (typeof content === 'string') {
    // Check if it looks like HTML
    if (content.includes('<') && content.includes('>')) {
      return (
        <div
          className={cn('editorial-prose font-serif text-lg leading-[1.8] space-y-6', className)}
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(content) }}
        />
      );
    }
    // Plain text split by paragraphs
    const paragraphs = content.split('\n\n').filter(Boolean);
    return (
      <div className={cn('editorial-prose font-serif text-[17px] sm:text-[18px] leading-[1.8] sm:leading-[1.85] text-foreground/90 space-y-6', className)}>
        {paragraphs.map((p, idx) => (
          <p key={idx} className={idx === 0 && withDropCap ? 'first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:leading-none first-letter:font-serif first-letter:pr-3 first-letter:pt-0.5 first-letter:font-bold first-letter:text-foreground' : ''}>
            {p}
          </p>
        ))}
      </div>
    );
  }

  // If TipTap JSON object
  const doc = content as TipTapNode;
  if (!doc.content || !Array.isArray(doc.content)) {
    return null;
  }

  const renderTextWithMarks = (node: TipTapNode, key: React.Key) => {
    let element: React.ReactNode = node.text || '';

    if (node.marks && Array.isArray(node.marks)) {
      node.marks.forEach((mark) => {
        if (mark.type === 'bold') {
          element = <strong key={key} className="font-bold text-foreground">{element}</strong>;
        } else if (mark.type === 'italic') {
          element = <em key={key} className="italic">{element}</em>;
        } else if (mark.type === 'strike') {
          element = <s key={key} className="line-through">{element}</s>;
        } else if (mark.type === 'link') {
          element = (
            <a
              key={key}
              href={mark.attrs?.href || '#'}
              target={mark.attrs?.target || '_blank'}
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 decoration-1 hover:decoration-2 font-medium"
            >
              {element}
            </a>
          );
        } else if (mark.type === 'code') {
          element = (
            <code key={key} className="font-mono text-xs bg-surface-muted px-1.5 py-0.5 border border-border-hairline">
              {element}
            </code>
          );
        }
      });
    }

    return <React.Fragment key={key}>{element}</React.Fragment>;
  };

  const renderNode = (node: TipTapNode, index: number): React.ReactNode => {
    switch (node.type) {
      case 'paragraph': {
        const isFirst = index === 0;
        return (
          <p
            key={index}
            className={cn(
              'font-serif text-[17px] sm:text-[18px] leading-[1.8] sm:leading-[1.85] text-foreground/90 font-normal',
              isFirst && withDropCap
                ? 'first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:leading-none first-letter:font-serif first-letter:pr-3 first-letter:pt-0.5 first-letter:font-bold first-letter:text-foreground'
                : ''
            )}
          >
            {node.content?.map((child, cIdx) =>
              child.text ? renderTextWithMarks(child, cIdx) : renderNode(child, cIdx)
            )}
          </p>
        );
      }

      case 'heading': {
        const level = node.attrs?.level || 2;
        const textContent = node.content?.map((child) => child.text || '').join('') || '';

        if (level === 1) {
          return (
            <h1 key={index} className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-foreground pt-8 pb-2">
              {textContent}
            </h1>
          );
        }
        if (level === 2) {
          return (
            <h2 key={index} className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-foreground pt-8 pb-2 border-b border-border-hairline">
              {textContent}
            </h2>
          );
        }
        if (level === 3) {
          return (
            <h3 key={index} className="font-serif text-lg sm:text-xl font-normal text-foreground pt-6 pb-1">
              {textContent}
            </h3>
          );
        }
        return (
          <h4 key={index} className="font-mono text-xs uppercase tracking-wider font-semibold text-foreground pt-4">
            {textContent}
          </h4>
        );
      }

      case 'blockquote': {
        const quoteStyle = (node.attrs?.quoteStyle as string) === 'pull' ? 'pull' : 'standard';
        const citeAttr = (node.attrs?.cite as string) || '';

        return (
          <blockquote
            key={index}
            data-quote-style={quoteStyle}
            className={cn(
              'editorial-rich-blockquote my-8 relative font-serif text-foreground/90',
              quoteStyle === 'pull'
                ? 'max-w-2xl mx-auto py-8 px-4 sm:px-8 border-y border-border text-center text-xl sm:text-2xl leading-relaxed'
                : 'border-l-[3px] border-foreground bg-surface-muted/35 pl-5 sm:pl-7 pr-4 sm:pr-6 py-3.5 sm:py-4 text-[17px] sm:text-[18px] leading-[1.8] sm:leading-[1.85] rounded-r'
            )}
          >
            {node.content?.map((child, cIdx) => {
              if (child.type === 'paragraph') {
                return (
                  <p key={cIdx} className="my-1.5 first:mt-0 last:mb-0">
                    {child.content?.map((c, ccIdx) =>
                      c.text ? renderTextWithMarks(c, ccIdx) : renderNode(c, ccIdx)
                    )}
                  </p>
                );
              }
              if (child.type === 'cite') {
                const citeText = (child.content || []).map((c: any) => c.text || '').join('').replace(/^[—\s\-]+/, '').trim();
                if (!citeText) return null;
                return (
                  <cite key={cIdx} className="block mt-3.5 font-serif italic text-sm sm:text-[14.5px] text-foreground/65">
                    {citeText}
                  </cite>
                );
              }
              return renderNode(child, cIdx);
            })}
            {citeAttr && citeAttr.trim() && (
              <cite className="block mt-3.5 font-serif italic text-sm sm:text-[14.5px] text-foreground/65">
                {citeAttr.replace(/^[—\s\-]+/, '').trim()}
              </cite>
            )}
          </blockquote>
        );
      }

      case 'bulletList': {
        return (
          <ul key={index} className="my-6 pl-6 list-square space-y-2 font-serif text-[17px] sm:text-[18px] leading-relaxed text-foreground/90">
            {node.content?.map((child, cIdx) => renderNode(child, cIdx))}
          </ul>
        );
      }

      case 'orderedList': {
        return (
          <ol key={index} className="my-6 pl-6 list-decimal space-y-2 font-serif text-[17px] sm:text-[18px] leading-relaxed text-foreground/90 font-mono-numbers">
            {node.content?.map((child, cIdx) => renderNode(child, cIdx))}
          </ol>
        );
      }

      case 'listItem': {
        return (
          <li key={index} className="pl-1">
            {node.content?.map((child, cIdx) =>
              child.type === 'paragraph' ? (
                <span key={cIdx}>
                  {child.content?.map((grandChild, gIdx) =>
                    grandChild.text ? renderTextWithMarks(grandChild, gIdx) : renderNode(grandChild, gIdx)
                  )}
                </span>
              ) : (
                renderNode(child, cIdx)
              )
            )}
          </li>
        );
      }

      case 'horizontalRule': {
        return (
          <div key={index} className="my-10 flex items-center justify-center gap-2 text-muted">
            <span className="w-1.5 h-1.5 bg-current" />
            <span className="w-1.5 h-1.5 bg-current" />
            <span className="w-1.5 h-1.5 bg-current" />
          </div>
        );
      }

      case 'image': {
        return (
          <figure key={index} className="my-10 space-y-2 border border-border p-2 bg-surface">
            <img
              src={node.attrs?.src}
              alt={node.attrs?.alt || 'Ilustrasi artikel'}
              className="w-full h-auto object-cover"
            />
            {node.attrs?.title && (
              <figcaption className="font-mono text-xs text-muted text-center tracking-wide uppercase pt-1">
                {node.attrs.title}
              </figcaption>
            )}
          </figure>
        );
      }

      case 'codeBlock': {
        const codeText = node.content?.map((c) => c.text || '').join('\n') || '';
        return (
          <pre key={index} className="my-6 p-4 bg-foreground text-background font-mono text-xs overflow-x-auto border border-foreground">
            <code>{codeText}</code>
          </pre>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={cn('editorial-prose max-w-prose space-y-6', className)}>
      {doc.content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
