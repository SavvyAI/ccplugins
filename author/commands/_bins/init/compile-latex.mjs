#!/usr/bin/env node

/**
 * compile-latex.mjs
 *
 * Compiles book markdown sources into a LaTeX document.
 * Reads book/book.json manifest and generates book/dist/latex/book.tex
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BOOK_DIR = join(ROOT, 'book');
const DIST_DIR = join(BOOK_DIR, 'dist', 'latex');

/**
 * Read and parse book.json manifest
 */
function readManifest() {
  const manifestPath = join(BOOK_DIR, 'book.json');
  return JSON.parse(readFileSync(manifestPath, 'utf-8'));
}

/**
 * Read a markdown file from the book directory
 */
function readMarkdownFile(subdir, filename) {
  const filePath = join(BOOK_DIR, subdir, filename);
  if (!existsSync(filePath)) {
    console.warn(`Warning: File not found: ${filePath}`);
    return '';
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Escape special LaTeX characters
 */
function escapeLatex(text) {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Convert markdown to LaTeX
 */
function markdownToLatex(markdown, options = {}) {
  const { isChapter = false, chapterNumber = null, partTitle = null } = options;

  let latex = markdown;

  // Remove HTML comments
  latex = latex.replace(/<!--[\s\S]*?-->/g, '');

  // Handle code blocks (before other processing)
  latex = latex.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const language = lang || 'text';
    const escapedCode = code
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}');
    return `\n\\begin{lstlisting}[language=${language}]\n${code}\\end{lstlisting}\n`;
  });

  // Handle inline code
  latex = latex.replace(/`([^`]+)`/g, (_, code) => {
    return `\\texttt{${escapeLatex(code)}}`;
  });

  // Handle headers
  // # H1 -> \chapter{} (only for chapter files)
  // ## H2 -> \section{}
  // ### H3 -> \subsection{}
  // #### H4 -> \subsubsection{}

  latex = latex.replace(/^# (.+)$/gm, (_, title) => {
    if (isChapter && chapterNumber !== null) {
      return `\\chapter{${escapeLatex(title)}}`;
    }
    // For front/back matter, use chapter* (unnumbered)
    return `\\chapter*{${escapeLatex(title)}}`;
  });

  latex = latex.replace(/^## (.+)$/gm, (_, title) => {
    return `\\section{${escapeLatex(title)}}`;
  });

  latex = latex.replace(/^### (.+)$/gm, (_, title) => {
    return `\\subsection{${escapeLatex(title)}}`;
  });

  latex = latex.replace(/^#### (.+)$/gm, (_, title) => {
    return `\\subsubsection{${escapeLatex(title)}}`;
  });

  // Handle bold and italic
  latex = latex.replace(/\*\*\*(.+?)\*\*\*/g, '\\textbf{\\textit{$1}}');
  latex = latex.replace(/\*\*(.+?)\*\*/g, '\\textbf{$1}');
  latex = latex.replace(/\*(.+?)\*/g, '\\textit{$1}');
  latex = latex.replace(/_(.+?)_/g, '\\textit{$1}');

  // Handle links [text](url)
  latex = latex.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    return `\\href{${url}}{${escapeLatex(text)}}`;
  });

  // Handle horizontal rules
  latex = latex.replace(/^---+$/gm, '\\hrulefill\n');

  // Handle unordered lists
  latex = latex.replace(/^(\s*)[-*] (.+)$/gm, (_, indent, item) => {
    return `${indent}\\item ${item}`;
  });

  // Wrap consecutive list items in itemize environment
  const lines = latex.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    if (line.trim().startsWith('\\item ')) {
      if (!inList) {
        result.push('\\begin{itemize}');
        inList = true;
      }
      result.push(line);
    } else {
      if (inList) {
        result.push('\\end{itemize}');
        inList = false;
      }
      result.push(line);
    }
  }
  if (inList) {
    result.push('\\end{itemize}');
  }

  return result.join('\n');
}

/**
 * Generate LaTeX preamble
 */
function generatePreamble(manifest) {
  return `\\documentclass[11pt,letterpaper]{book}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{hyperref}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage{geometry}

% Page geometry
\\geometry{
  letterpaper,
  margin=1in
}

% Hyperref setup
\\hypersetup{
  colorlinks=true,
  linkcolor=blue,
  urlcolor=blue,
  pdftitle={${escapeLatex(manifest.title)}},
  pdfauthor={${escapeLatex(manifest.author)}}
}

% Listings setup for code blocks
\\lstset{
  basicstyle=\\ttfamily\\small,
  breaklines=true,
  frame=single,
  backgroundcolor=\\color{gray!10},
  numbers=left,
  numberstyle=\\tiny\\color{gray},
  tabsize=2
}

% Title info
\\title{${escapeLatex(manifest.title)}}
\\author{${escapeLatex(manifest.author)}}
\\date{Version ${manifest.version}}

\\begin{document}

`;
}

/**
 * Generate LaTeX closing
 */
function generateClosing() {
  return `
\\end{document}
`;
}

/**
 * Main compilation function
 */
function compile() {
  console.log('Reading book manifest...');
  const manifest = readManifest();

  console.log(`Compiling: ${manifest.title} v${manifest.version}`);

  // Ensure output directory exists
  mkdirSync(DIST_DIR, { recursive: true });

  let latex = generatePreamble(manifest);

  // Front matter
  latex += '\\frontmatter\n';
  latex += '\\maketitle\n';
  latex += '\\tableofcontents\n\n';

  console.log('Processing front matter...');
  for (const item of manifest.frontMatter || []) {
    // Skip title page (handled by \maketitle)
    if (item.file === 'title.md') continue;

    const content = readMarkdownFile('front-matter', item.file);
    if (content) {
      latex += markdownToLatex(content);
      latex += '\n\n';
    }
  }

  // Main matter (chapters)
  latex += '\\mainmatter\n\n';

  // Group chapters by part (if parts exist)
  const partMap = new Map();
  for (const part of manifest.parts || []) {
    partMap.set(part.number, part);
  }

  let currentPart = null;

  console.log('Processing chapters...');
  for (const chapter of manifest.chapters || []) {
    // Check if we need to start a new part
    for (const part of manifest.parts || []) {
      if (part.chapters && part.chapters.includes(chapter.number) && currentPart !== part.number) {
        currentPart = part.number;
        latex += `\\part{${escapeLatex(part.title)}}\n\n`;
        break;
      }
    }

    const content = readMarkdownFile('chapters', chapter.file);
    if (content) {
      latex += markdownToLatex(content, {
        isChapter: true,
        chapterNumber: chapter.number
      });
      latex += '\n\n';
    }
  }

  // Back matter (appendices)
  latex += '\\backmatter\n\n';
  latex += '\\appendix\n\n';

  console.log('Processing back matter...');
  for (const item of manifest.backMatter || []) {
    const content = readMarkdownFile('back-matter', item.file);
    if (content) {
      latex += markdownToLatex(content);
      latex += '\n\n';
    }
  }

  latex += generateClosing();

  // Write output
  const outputPath = join(DIST_DIR, 'book.tex');
  writeFileSync(outputPath, latex, 'utf-8');

  console.log(`\nLaTeX output written to: ${outputPath}`);
  return outputPath;
}

// Run if called directly
compile();

export { compile };
