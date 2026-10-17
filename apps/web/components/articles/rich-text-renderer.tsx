import * as React from 'react';
import DOMPurify from 'isomorphic-dompurify';
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
 * Robust, DOM-based HTML sanitizer for editorial rich text rendering
 * Strips executable scripts, event handlers, and dangerous tags using DOMPurify
 */
function sanitizeEditorialHtml(raw: string): string {
  if (!raw) return '';

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'ul', 'ol', 'li', 'strong', 'em', 's', 'u', 'a',
      'img', 'hr', 'br', 'span', 'code', 'pre', 'figure', 'figcaption'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
}

export function RichTextRenderer({
  content,
  className,
  withDropCap = false,
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
          className={cn('editorial-prose max-w-[680px] mx-auto font-serif space-y-5 text-foreground/90', className)}
          dangerouslySetInnerHTML={{ __html: sanitizeEditorialHtml(content) }}
        />
      );
    }
    // Plain text split by paragraphs
    const paragraphs = content.split('\n\n').filter(Boolean);
    return (
      <div className={cn('editorial-prose max-w-[680px] mx-auto font-serif space-y-5 text-foreground/90', className)}>
        {paragraphs.map((p, idx) => (
          <p
            key={idx}
            className={cn(
              'my-5 first:mt-0 last:mb-0 font-normal',
              idx === 0 && withDropCap
                ? 'first-letter:float-left first-letter:text-4xl sm:first-letter:text-5xl first-letter:leading-none first-letter:font-serif first-letter:pr-3 first-letter:pt-0.5 first-letter:font-bold first-letter:text-foreground'
                : ''
            )}
          >
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
              'my-5 first:mt-0 last:mb-0 font-normal',
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
                ? 'max-w-2xl mx-auto py-8 px-4 sm:px-8 border-y-2 border-foreground text-center text-[1.18em] leading-relaxed italic'
                : 'border-l-4 border-foreground bg-surface-muted/40 pl-5 sm:pl-7 pr-4 sm:pr-6 py-4 rounded-none italic'
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
                  <cite key={cIdx} className="block mt-3.5 font-serif italic text-sm text-foreground/65 not-italic">
                    — {citeText}
                  </cite>
                );
              }
              return renderNode(child, cIdx);
            })}
            {citeAttr && citeAttr.trim() && (
              <cite className="block mt-3.5 font-serif italic text-sm text-foreground/65 not-italic">
                — {citeAttr.replace(/^[—\s\-]+/, '').trim()}
              </cite>
            )}
          </blockquote>
        );
      }

      case 'bulletList': {
        return (
          <ul key={index} className="my-6 pl-6 list-square space-y-2">
            {node.content?.map((child, cIdx) => renderNode(child, cIdx))}
          </ul>
        );
      }

      case 'orderedList': {
        return (
          <ol key={index} className="my-6 pl-6 list-decimal space-y-2 font-mono-numbers">
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
    <div className={cn('editorial-prose max-w-[680px] mx-auto space-y-6', className)}>
      {doc.content.map((node, index) => renderNode(node, index))}
    </div>
  );
}
