function renderTable(columns, data) {
  const container = document.getElementById('result-table');
  if (!columns.length || !data.length) {
    container.innerHTML = '<p class="text-center py-4">لا توجد بيانات للعرض.</p>';
    return;
  }

  // إضافة عنوان للجدول
  let html = '<h3 class="text-lg font-bold mb-3 text-right">جدول البيانات:</h3>';

  // إنشاء جدول مع تصميم محسن
  html += '<div class="overflow-x-auto"><table class="min-w-full border rounded"><thead class="bg-gray-100"><tr>';
  columns.forEach(col => html += `<th class="border px-4 py-2 text-right">${col}</th>`);
  html += '</tr></thead><tbody>';

  // إضافة صفوف البيانات مع تلوين متناوب
  data.forEach((row, index) => {
    const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    html += `<tr class="${rowClass}">`;
    columns.forEach(col => {
      // تنسيق القيم الرقمية بشكل مختلف
      const value = row[col];
      const isNumeric = !isNaN(parseFloat(value)) && isFinite(value);
      const cellClass = isNumeric ? 'text-left' : 'text-right';
      html += `<td class="border px-4 py-2 ${cellClass}">${value}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}
