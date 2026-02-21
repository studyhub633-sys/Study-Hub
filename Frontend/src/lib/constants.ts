export const EXAM_BOARDS = [
    "Edexcel",
    "AQA",
    "Eduqas/WJEC",
    "OCR",
];

// Official exam board domains - only links to these domains should be used
export const OFFICIAL_EXAM_BOARD_DOMAINS = [
    "aqa.org.uk",
    "pearson.com",
    "qualifications.pearson.com",
    "ocr.org.uk",
    "eduqas.co.uk",
    "wjec.co.uk",
];

// Official past papers pages per exam board
export const EXAM_BOARD_PAPER_URLS: Record<string, string> = {
    "AQA": "https://www.aqa.org.uk/find-past-papers-and-mark-schemes",
    "Edexcel": "https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html",
    "OCR": "https://www.ocr.org.uk/qualifications/past-paper-finder/",
    "Eduqas/WJEC": "https://www.eduqas.co.uk/qualifications/",
};
