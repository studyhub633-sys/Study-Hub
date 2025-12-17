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

    return (
        <div className={cn("space-y-4 text-foreground leading-relaxed", className)}>
            {paragraphs.map((paragraph, index) => {
                // Check if paragraph is just an image to center/style it properly
                const isImage = /^!\[.*\]\(.+\)$/g.test(paragraph.trim());

                return (
                    <p key={index} className={cn(isImage && "flex justify-center")}>
                        {renderText(paragraph)}
                    </p>
                );
            })}
        </div>
    );
};
