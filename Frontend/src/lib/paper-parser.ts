
export type PaperMetadata = {
    board: 'AQA' | 'Edexcel' | 'OCR' | 'Eduqas' | 'WJEC' | 'Unknown';
    subjectCode?: string;
    year?: string;
    month?: string;
    type: 'Question Paper' | 'Mark Scheme' | 'Examiner Report' | 'Other';
    rawUrl: string;
};

export class SmartPaperParser {
    static parse(url: string): PaperMetadata {
        if (!url) return { board: 'Unknown', type: 'Other', rawUrl: url };

        const filename = url.split('/').pop() || '';

        if (url.includes('aqa.org.uk')) {
            return this.parseAQA(filename, url);
        } else if (url.includes('pearson.com') || filename.includes('9MA0') || filename.includes('8MA0')) {
            return this.parseEdexcel(filename, url);
        } else if (url.includes('ocr.org.uk')) {
            return this.parseOCR(filename, url);
        }

        return {
            board: 'Unknown',
            type: 'Other',
            rawUrl: url,
        };
    }

    private static parseAQA(filename: string, url: string): PaperMetadata {
        const regex = /AQA-([A-Z0-9]+)-([A-Z]+)-([A-Z]+)(\d{2})/i;
        const match = filename.match(regex);

        if (match) {
            return {
                board: 'AQA',
                subjectCode: match[1],
                type: this.mapType(match[2]),
                month: this.mapMonth(match[3]),
                year: '20' + match[4],
                rawUrl: url
            };
        }

        return { board: 'AQA', type: 'Other', rawUrl: url };
    }

    private static parseEdexcel(filename: string, url: string): PaperMetadata {
        const regex = /([A-Z0-9]+)_(\w+)_(\w+)_(\d{4})(\d{2})(\d{2})/;
        const match = filename.match(regex);

        if (match) {
            return {
                board: 'Edexcel',
                subjectCode: match[1],
                type: this.mapType(match[3]),
                year: match[4],
                month: this.mapMonthNumber(match[5]),
                rawUrl: url
            };
        }

        return { board: 'Edexcel', type: 'Other', rawUrl: url };
    }

    private static parseOCR(filename: string, url: string): PaperMetadata {
        const type = filename.includes('question-paper') ? 'Question Paper'
            : filename.includes('mark-scheme') ? 'Mark Scheme'
                : 'Other';

        return {
            board: 'OCR',
            type: type,
            subjectCode: filename.split('-')[0],
            rawUrl: url
        };
    }

    private static mapType(code: string): PaperMetadata['type'] {
        const c = code.toUpperCase();
        if (c === 'QP' || c === 'QUE') return 'Question Paper';
        if (c === 'MS' || c === 'RMS') return 'Mark Scheme';
        if (c === 'ER' || c === 'REP') return 'Examiner Report';
        return 'Other';
    }

    private static mapMonth(code: string): string {
        const c = code.toUpperCase();
        if (c === 'JUN') return 'June';
        if (c === 'NOV') return 'November';
        if (c === 'JAN') return 'January';
        return code;
    }

    private static mapMonthNumber(num: string): string {
        if (num === '06') return 'June';
        if (num === '11') return 'November';
        if (num === '01') return 'January';
        return num;
    }
}
