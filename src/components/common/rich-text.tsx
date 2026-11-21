import { cn } from "@/lib/utils";

/**
 * Renders HTML from the admin rich-text editor (headings, paragraphs, lists,
 * links, bold/italic, images, tables). The API must sanitise the HTML server-side.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-none t-body-l text-ink-soft",
        "[&>*+*]:mt-4 [&_h2]:t-h3 [&_h2]:text-ink [&_h3]:t-h4 [&_h3]:text-ink [&_h3]:!mt-6 [&_h2]:!mt-7",
        "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mt-1.5 [&_li]:marker:text-orange-500",
        "[&_a]:text-brown-700 [&_a]:underline [&_a:hover]:text-orange-600 [&_strong]:font-semibold [&_strong]:text-ink",
        "[&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-4 [&_blockquote]:italic",
        "[&_table]:w-full [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-line [&_th]:bg-cream-100 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
