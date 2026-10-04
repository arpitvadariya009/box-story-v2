import * as XLSX from 'xlsx';

/**
 * Clean & escape values for CSV
 * Uses ="..." for dates and numeric strings so Microsoft Excel opens them
 * directly as clean text without converting dates to '#######' or numbers to scientific notation.
 */
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  if (str === '') return '""';

  // Check if value is a date (e.g. "08/09/2026", "08/09/2026, 14:30", "2026-09-08")
  const isDate = /^\d{2}\/\d{2}\/\d{4}/.test(str) || /^\d{4}-\d{2}-\d{2}/.test(str);
  if (isDate) {
    return `="${str.replace(/"/g, '""')}"`;
  }

  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};

/**
 * Export data as CSV
 */
export const exportToCSV = (filename, headers, rows) => {
  try {
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n');

    // Add UTF-8 BOM so Excel opens Hindi, special symbols, and INR properly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    return false;
  }
};

/**
 * Export data as genuine Excel (.xlsx) file with auto-adjusted column widths
 */
export const exportToExcel = (filename, headers, rows) => {
  try {
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Calculate dynamic column widths with padding to ensure no '#######' date clipping
    const colWidths = headers.map((header, colIdx) => {
      let maxLen = header ? String(header).length : 10;
      rows.forEach((row) => {
        const cell = row[colIdx];
        if (cell !== null && cell !== undefined) {
          const len = String(cell).length;
          if (len > maxLen) maxLen = len;
        }
      });
      return { wch: Math.max(maxLen + 4, 14) };
    });
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');

    const cleanName = filename.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(wb, `${cleanName}_${Date.now()}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel Export Error:', error);
    // Fallback to CSV if xlsx write fails
    return exportToCSV(filename, headers, rows);
  }
};

/**
 * Export data as beautifully styled PDF / Printable Document
 */
export const exportToPDF = (title, headers, rows) => {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return true;
    }

    const tableHeadersHtml = headers
      .map((h) => `<th style="padding: 10px 12px; background: #0F1729; color: #ffffff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; text-align: left; border: 1px solid #1E293B;">${h}</th>`)
      .join('');

    const tableRowsHtml = rows
      .map(
        (row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
          ${row
            .map(
              (cell) => `
            <td style="padding: 9px 12px; font-size: 12px; color: #334155; border: 1px solid #E2E8F0;">
              ${cell !== null && cell !== undefined ? String(cell) : '—'}
            </td>`
            )
            .join('')}
        </tr>`
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 24px;
              color: #0F1729;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #D90B37;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              color: #0F1729;
            }
            .meta {
              font-size: 11px;
              color: #64748B;
              text-align: right;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            @media print {
              body { padding: 0; }
              @page { margin: 1.5cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">${title}</div>
              <div style="font-size: 12px; color: #64748B; margin-top: 4px;">BoxStory Enterprise Management System</div>
            </div>
            <div class="meta">
              <div><strong>Generated:</strong> ${new Date().toLocaleString('en-GB')}</div>
              <div><strong>Total Records:</strong> ${rows.length}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>${tableHeadersHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    window.print();
    return false;
  }
};

/**
 * Queue/Chunked Fetcher for Large Datasets
 * Fetches data in controlled sequential batches (e.g. 250-500 items per request)
 * to prevent API timeouts, database spikes, and browser crashes.
 * Supports progress callback and automatic retry with exponential backoff.
 */
export const fetchPaginatedDataQueue = async ({
  fetchPage,
  batchSize = 250,
  maxRetries = 3,
  onProgress = () => {},
}) => {
  let allItems = [];
  let currentPage = 1;
  let totalItems = null;
  let totalPages = 1;

  onProgress({
    phase: 'fetching',
    current: 0,
    total: 0,
    percentage: 0,
    message: 'Starting export queue...',
  });

  while (currentPage <= totalPages) {
    let attempt = 0;
    let success = false;
    let result = null;

    while (attempt < maxRetries && !success) {
      try {
        result = await fetchPage(currentPage, batchSize);
        success = true;
      } catch (err) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`Failed to fetch batch ${currentPage} after ${maxRetries} attempts: ${err.message || err}`);
        }
        // Wait before retry
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }

    const items = result?.items || (Array.isArray(result) ? result : []);
    if (items.length === 0 && currentPage > 1) break;

    allItems = allItems.concat(items);

    if (totalItems === null) {
      totalItems = result?.total ?? items.length;
      totalPages = result?.totalPages || Math.ceil(totalItems / batchSize) || 1;
    }

    const currentCount = allItems.length;
    const effectiveTotal = Math.max(totalItems || 0, currentCount);
    const pct = effectiveTotal > 0 ? Math.min(Math.round((currentCount / effectiveTotal) * 90), 90) : 50;

    onProgress({
      phase: 'fetching',
      current: currentCount,
      total: effectiveTotal,
      percentage: pct,
      message: `Fetching batch ${currentPage} of ${totalPages} (${currentCount.toLocaleString('en-IN')} / ${effectiveTotal.toLocaleString('en-IN')} records)...`,
    });

    if (items.length < batchSize || currentPage >= totalPages) {
      break;
    }

    currentPage++;
    // Small delay to yield to browser event loop and prevent thread lock
    await new Promise((r) => setTimeout(r, 40));
  }

  onProgress({
    phase: 'processing',
    current: allItems.length,
    total: allItems.length,
    percentage: 95,
    message: `Formatting ${allItems.length.toLocaleString('en-IN')} records into export file...`,
  });

  return allItems;
};

/**
 * Universal dispatcher
 */
export const handleExport = (format, filename, headers, rows) => {
  const cleanFormat = (format || 'CSV').toUpperCase();
  if (cleanFormat === 'EXCEL') {
    return exportToExcel(filename, headers, rows);
  } else if (cleanFormat === 'PDF') {
    return exportToPDF(filename, headers, rows);
  } else {
    return exportToCSV(filename, headers, rows);
  }
};
