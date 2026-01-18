#!/usr/bin/env node

/**
 * preview-pdf.mjs
 *
 * Compiles the book to PDF using pdflatex and opens it for preview.
 *
 * Usage:
 *   node scripts/preview-pdf.mjs          # Compile and open PDF
 *   node scripts/preview-pdf.mjs --no-open  # Compile only, don't open
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST_DIR = join(ROOT, 'book', 'dist', 'latex');

const args = process.argv.slice(2);
const noOpen = args.includes('--no-open');

/**
 * Run LaTeX compilation
 */
async function compileLatex() {
  console.log('Step 1: Compiling markdown to LaTeX...\n');

  try {
    execSync('node scripts/compile-latex.mjs', {
      cwd: ROOT,
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('LaTeX compilation failed');
    process.exit(1);
  }
}

/**
 * Check if pdflatex is available
 */
function checkPdflatex() {
  try {
    execSync('which pdflatex', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Run pdflatex to generate PDF
 */
function runPdflatex() {
  const texFile = join(DIST_DIR, 'book.tex');

  if (!existsSync(texFile)) {
    console.error(`Error: LaTeX file not found: ${texFile}`);
    process.exit(1);
  }

  console.log('\nStep 2: Running pdflatex (first pass)...\n');

  try {
    // First pass
    execSync(`pdflatex -interaction=nonstopmode -output-directory="${DIST_DIR}" "${texFile}"`, {
      cwd: DIST_DIR,
      stdio: 'inherit'
    });

    console.log('\nStep 3: Running pdflatex (second pass for TOC)...\n');

    // Second pass for TOC and references
    execSync(`pdflatex -interaction=nonstopmode -output-directory="${DIST_DIR}" "${texFile}"`, {
      cwd: DIST_DIR,
      stdio: 'inherit'
    });

  } catch (error) {
    console.error('\npdflatex encountered errors. Check the log file for details.');
    console.error(`Log file: ${join(DIST_DIR, 'book.log')}`);
    // Don't exit - PDF may still be usable
  }
}

/**
 * Open PDF in default viewer (macOS)
 */
function openPdf() {
  const pdfFile = join(DIST_DIR, 'book.pdf');

  if (!existsSync(pdfFile)) {
    console.error(`Error: PDF file not found: ${pdfFile}`);
    process.exit(1);
  }

  console.log(`\nOpening PDF: ${pdfFile}\n`);

  // Use 'open' command on macOS
  spawn('open', [pdfFile], {
    detached: true,
    stdio: 'ignore'
  }).unref();
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('Book PDF Preview');
  console.log('='.repeat(60));
  console.log();

  // Check for pdflatex
  if (!checkPdflatex()) {
    console.error('Error: pdflatex not found.');
    console.error('Please install TeX Live: brew install texlive');
    process.exit(1);
  }

  // Step 1: Compile markdown to LaTeX
  await compileLatex();

  // Step 2 & 3: Run pdflatex
  runPdflatex();

  // Step 4: Open PDF (unless --no-open)
  if (!noOpen) {
    openPdf();
  } else {
    const pdfFile = join(DIST_DIR, 'book.pdf');
    console.log(`\nPDF generated: ${pdfFile}`);
  }

  console.log('\nDone!');
}

main().catch(console.error);
