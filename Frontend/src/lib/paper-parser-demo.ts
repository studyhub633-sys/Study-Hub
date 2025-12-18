
type PaperMetadata = {
    board: 'AQA' | 'Edexcel' | 'OCR' | 'Eduqas' | 'WJEC' | 'Unknown';
    subjectCode?: string;
    year?: string;
    month?: string;
    type: 'Question Paper' | 'Mark Scheme' | 'Examiner Report' | 'Other';
    rawUrl: string;
};

export class SmartPaperParser {
    static parse(url: string): PaperMetadata {
        const filename = url.split('/').pop() || '';

        if (url.includes('aqa.org.uk')) {
            return this.parseAQA(filename, url);
        } else if (url.includes('pearson.com') || filename.includes('9MA0') || filename.includes('8MA0')) { // Edexcel Logic
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
        // Example: AQA-8300H-QP-JUN23.PDF
        // Regex: AQA-(\w+)-(\w+)-(\w+)(\d{2})
        const regex = /AQA-([A-Z0-9]+)-([A-Z]+)-([A-Z]+)(\d{2})/i;
        const match = filename.match(regex);

        if (match) {
            const parentDir = url.split('/').slice(-2, -1)[0]; // e.g. sample-papers-2023
            const yearFromDir = parentDir.match(/\d{4}/)?.[0];

            return {
                board: 'AQA',
                subjectCode: match[1], // 8300H
                type: this.mapType(match[2]), // QP
                month: this.mapMonth(match[3]), // JUN
                year: '20' + match[4], // 23 -> 2023
                rawUrl: url
            };
        }

        return { board: 'AQA', type: 'Other', rawUrl: url };
    }

    private static parseEdexcel(filename: string, url: string): PaperMetadata {
        // Example: 9MA0_01_que_20230606.pdf
        // Regex: (\w+)_(\w+)_(\w+)_(\d{8})
        const regex = /([A-Z0-9]+)_(\w+)_(\w+)_(\d{4})(\d{2})(\d{2})/;
        const match = filename.match(regex);

        if (match) {
            return {
                board: 'Edexcel',
                subjectCode: match[1],
                type: this.mapType(match[3]), // que -> Question Paper
                year: match[4],
                month: this.mapMonthNumber(match[5]),
                rawUrl: url
            };
        }

        return { board: 'Edexcel', type: 'Other', rawUrl: url };
    }

    private static parseOCR(filename: string, url: string): PaperMetadata {
        // OCR often has less structured filenames in public view, relying on text extract.
        // Example: 675306-question-paper-pure-mathematics-and-mechanics.pdf
        const type = filename.includes('question-paper') ? 'Question Paper'
            : filename.includes('mark-scheme') ? 'Mark Scheme'
                : 'Other';

        return {
            board: 'OCR',
            type: type,
            subjectCode: filename.split('-')[0], // often the ID code
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

// Demo Runner
const samples = [
    'https://filestore.aqa.org.uk/sample-papers-2023/AQA-8300H-QP-JUN23.PDF',
    'https://qualifications.pearson.com/content/dam/pdf/A%20Level/Mathematics/2017/Exam%20materials/9MA0_01_que_20230606.pdf',
    'https://www.ocr.org.uk/Images/675306-question-paper-pure-mathematics-and-mechanics.pdf',
    'https://filestore.aqa.org.uk/sample-papers-2023/AQA-8300H-MS-JUN23.PDF'
];

console.log("--- Smart Link Parser Demo ---");
samples.forEach(url => {
    console.log(`\nParsing: ${url}`);
    console.log(JSON.stringify(SmartPaperParser.parse(url), null, 2));
});
