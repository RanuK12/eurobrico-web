/**
 * Eurobrico 2.0 — Generatore PDF Professionale
 * Oficina Ranuk Digital Solutions
 *
 * Uso: node docs/generate-pdfs.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const SRC_DIR = path.join(__dirname, 'pdf-src');
const OUT_DIR = path.join(__dirname, 'pdf');

const DOCS = [
  {
    id: 'proposta_commerciale',
    input: 'proposta_commerciale.html',
    output: '01_Proposta_Commerciale_Eurobrico2.0.pdf',
    label: '💼 Proposta Commerciale'
  },
  {
    id: 'audit_report',
    input: 'audit_report.html',
    output: '02_Audit_Report_eurobrico.com.pdf',
    label: '🔍 Audit Report'
  },
  {
    id: 'presentazione_esecutiva',
    input: 'presentazione_esecutiva.html',
    output: '03_Presentazione_Esecutiva.pdf',
    label: '🎯 Presentazione Esecutiva'
  }
];

async function generatePDF(browser, doc) {
  const inputPath = path.join(SRC_DIR, doc.input);
  const outputPath = path.join(OUT_DIR, doc.output);

  if (!fs.existsSync(inputPath)) {
    console.error(`  ⚠️  File non trovato: ${inputPath}`);
    return false;
  }

  const page = await browser.newPage();

  try {
    // Load the HTML file
    const fileUrl = `file:///${inputPath.replace(/\\/g, '/')}`;
    await page.goto(fileUrl, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Generate PDF with professional settings
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false
    });

    console.log(`  ✅ ${doc.label} → ${doc.output}`);
    return true;
  } catch (error) {
    console.error(`  ❌ Errore su ${doc.label}: ${error.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('\n🚀 Eurobrico 2.0 — Generazione PDF Documenti');
  console.log('=' .repeat(52));
  console.log(`📁 Sorgente:  ${SRC_DIR}`);
  console.log(`📁 Output:    ${OUT_DIR}`);
  console.log('');

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none'
      ]
    });

    console.log('🖨️  Generazione documenti in corso...\n');
    let success = 0;

    for (const doc of DOCS) {
      const ok = await generatePDF(browser, doc);
      if (ok) success++;
    }

    console.log('\n' + '='.repeat(52));
    console.log(`✨ Completato: ${success}/${DOCS.length} documenti generati`);

    if (success > 0) {
      console.log(`\n📂 PDF disponibili in:`);
      console.log(`   ${OUT_DIR}`);
      DOCS.forEach(doc => {
        const outPath = path.join(OUT_DIR, doc.output);
        if (fs.existsSync(outPath)) {
          const size = (fs.statSync(outPath).size / 1024).toFixed(0);
          console.log(`   ${doc.label}: ${doc.output} (${size} KB)`);
        }
      });
    }

  } catch (err) {
    console.error('\n❌ Errore critico:', err.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }

  console.log('\n🎉 PDF pronti per la presentazione!\n');
}

main();
