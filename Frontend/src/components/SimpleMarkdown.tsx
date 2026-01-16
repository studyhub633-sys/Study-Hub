import { cn } from "@/lib/utils";
import React from 'react';

interface SimpleMarkdownProps {
    content: string;
    className?: string;
}

export const SimpleMarkdown: React.FC<SimpleMarkdownProps> = ({ content, className }) => {
    if (!content) return null;

    // Split content by newlines to handle paragraphs
    const paragraphs = content.split(/\n\s*\n/);

    const renderText = (text: string) => {
        // Basic parser for images: ![alt](url)
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        // Basic parser for links: [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        // Basic parser for bold: **text**
        const boldRegex = /\*\*([^*]+)\*\*/g;
        // Basic parser for code: `text`
        const codeRegex = /`([^`]+)`/g;

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;

        // Helper to process a string with regex and return segments
        // This is a simplified approach; doing a full tokenizer is out of scope for "Simple"
        // We will assume images are on their own line for safety or handle them first.

        // For this simple implementation, we'll process rules sequentially on the string 
        // but React rendering is tricky with nested replacements. 
        // Better strategy: Split by Image, then by Link, then Bold.

        // 1. Split by Image
        const imageParts = text.split(imageRegex);
        // If no match, imageParts is [text]
        // If match, imageParts is [pre, alt, url, post, alt2, url2, post2...]

        let result: React.ReactNode[] = [];

        // Re-construct with images replaced
        if (imageParts.length > 1) {
            for (let i = 0; i < imageParts.length; i++) {
                // Even indices are text, odd are the captures (alt, url) 
                // wait, split captures include the groups. 
                // text = "foo ![alt](url) bar" -> ["foo ", "alt", "url", " bar"]
                if (i % 3 === 0) {
                    // Text chunk
                    if (imageParts[i]) result.push(<span key={`text-${i}`}>{processLinks(imageParts[i], i)}</span>);
                } else if (i % 3 === 1) {
                    // Alt (skip, used in next step)
                } else {
                    // Url (current is url, previous is alt)
                    const alt = imageParts[i - 1];
                    const url = imageParts[i];
                    result.push(
                        <img
                            key={`img-${i}`}
                            src={url}
                            alt={alt}
                            className="rounded-lg max-h-[400px] w-auto my-4 border border-border shadow-sm"
                        />
                    );
                }
            }
        } else {
            result.push(<span key="text-0">{processLinks(text, 0)}</span>);
        }

        return result;
    };

    const processLinks = (text: string, baseKey: number) => {
        const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/g);
        // "foo [link](url) bar" -> ["foo ", "link", "url", " bar"]

        if (parts.length === 1) return processBold(text, baseKey, 0);

        const result: React.ReactNode[] = [];
        for (let i = 0; i < parts.length; i++) {
            if (i % 3 === 0) {
                if (parts[i]) result.push(processBold(parts[i], baseKey, i));
            } else if (i % 3 === 1) {
                // Link text
            } else {
                // URL
                const linkText = parts[i - 1];
                const url = parts[i];
                result.push(
                    <a
                        key={`link-${baseKey}-${i}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                    >
                        {linkText}
                    </a>
                );
            }
        }
        return result;
    };

    const processBold = (text: string, baseKey: number, subKey: number) => {
        const parts = text.split(/\*\*([^*]+)\*\*/g);
        // "foo **bold** bar" -> ["foo ", "bold", " bar"]

        if (parts.length === 1) return processCode(text, baseKey + subKey);

        const result: React.ReactNode[] = [];
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                if (parts[i]) result.push(processCode(parts[i], baseKey + subKey + i));
            } else {
                result.push(<strong key={`bold-${baseKey}-${subKey}-${i}`}>{parts[i]}</strong>);
            }
        }
        return result;
    };

    const processCode = (text: string, key: number) => {
        const parts = text.split(/`([^`]+)`/g);
        if (parts.length === 1) return text;

        const result: React.ReactNode[] = [];
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                result.push(parts[i]);
            } else {
                result.push(
                    <code key={`code-${key}-${i}`} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary">
                        {parts[i]}
                    </code>
                );
            }
        }
        return result;
    };

    // Process content line by line to handle headers and lists better
    const processContent = (content: string) => {
        const lines = content.split('\n');
        const elements: React.ReactNode[] = [];
        let currentParagraph: string[] = [];
        let currentList: string[] = [];

        const flushParagraph = () => {
            if (currentParagraph.length > 0) {
                const paraText = currentParagraph.join('\n');
                if (paraText.trim()) {
                    elements.push(
                        <p key={`para-${elements.length}`}>
                            {renderText(paraText)}
                        </p>
                    );
                }
                currentParagraph = [];
            }
        };

        const flushList = () => {
            if (currentList.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} className="list-disc pl-6 space-y-1 my-2">
                        {currentList.map((item, i) => (
                            <li key={i}>{renderText(item.replace(/^[-*]\s+/, ''))}</li>
                        ))}
                    </ul>
                );
                currentList = [];
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Check for headers (with or without space after #)
            if (trimmed.match(/^#{1,6}\s/)) {
                flushParagraph();
                flushList();
                const match = trimmed.match(/^(#{1,6})\s+(.+)$/);
                if (match) {
                    const level = match[1].length;
                    const text = match[2];
                    const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
                    const headingClasses = {
                        1: "text-2xl font-bold mt-6 mb-4",
                        2: "text-xl font-bold mt-5 mb-3",
                        3: "text-lg font-bold mt-4 mb-2",
                        4: "text-base font-bold mt-3 mb-2",
                        5: "text-sm font-bold mt-2 mb-1",
                        6: "text-xs font-bold mt-2 mb-1",
                    };
                    elements.push(
                        <HeadingTag key={`h-${elements.length}`} className={headingClasses[level as keyof typeof headingClasses] || headingClasses[3]}>
                            {renderText(text)}
                        </HeadingTag>
                    );
                    continue;
                }
            }

            // Check for list items
            if (trimmed.match(/^[-*]\s/)) {
                flushParagraph();
                currentList.push(trimmed);
                continue;
            }

            // Check for numbered lists
            if (trimmed.match(/^\d+\.\s/)) {
                flushParagraph();
                flushList();
                const items = [trimmed];
                // Collect consecutive numbered list items
                while (i + 1 < lines.length && lines[i + 1].trim().match(/^\d+\.\s/)) {
                    i++;
                    items.push(lines[i].trim());
                }
                elements.push(
                    <ol key={`ol-${elements.length}`} className="list-decimal pl-6 space-y-1 my-2">
                        {items.map((item, idx) => (
                            <li key={idx}>{renderText(item.replace(/^\d+\.\s+/, ''))}</li>
                        ))}
                    </ol>
                );
                continue;
            }

            // Regular line - add to current paragraph
            if (trimmed) {
                flushList();
                currentParagraph.push(line);
            } else {
                // Empty line - flush current paragraph
                flushParagraph();
                flushList();
            }
        }

        flushParagraph();
        flushList();

        return elements.length > 0 ? elements : [<p key="empty">{renderText(content)}</p>];
    };

    return (
        <div className={cn("space-y-4 text-foreground leading-relaxed", className)}>
            {processContent(content)}
        </div>
    );
};
