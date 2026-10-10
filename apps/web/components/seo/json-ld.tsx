import * as React from 'react';

interface JsonLdProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Reusable Type-Safe Structured Data (JSON-LD) Injector for Next.js App Router.
 * Emits W3C & Schema.org compliant structured data into the HTML document.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
