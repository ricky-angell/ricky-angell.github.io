/* BBY state resources: works with every course player's template navigation. */
(function () {
  'use strict';
  function applyState(select) {
    var lesson = select.closest('article') || document;
    lesson.querySelectorAll('.bby-state').forEach(function (item) {
      item.hidden = !!select.value && item.dataset.state !== select.value;
      item.open = !!select.value && item.dataset.state === select.value;
    });
    try { localStorage.setItem('bby-state-preference', select.value); } catch (_) {}
  }
  function restoreState() {
    var select = document.getElementById('bby-state-select');
    if (!select || select.dataset.initialized) return;
    select.dataset.initialized = 'true';
    try { select.value = localStorage.getItem('bby-state-preference') || ''; } catch (_) {}
    applyState(select);
  }
  document.addEventListener('change', function (event) {
    if (event.target.id === 'bby-state-select') applyState(event.target);
  });
  function safeCell(value) {
    value = String(value == null ? '' : value);
    // Avoid spreadsheet formula execution if students reuse the CSV with other text.
    if (/^[=+@-]/.test(value)) value = "'" + value;
    return '"' + value.replace(/"/g, '""') + '"';
  }
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.bby-download-state')) return;
    var select = document.getElementById('bby-state-select');
    if (!select || !select.value) {
      if (select) { select.focus(); select.setCustomValidity('Choose your state before downloading your checklist.'); select.reportValidity(); }
      return;
    }
    select.setCustomValidity('');
    var state = Array.from(document.querySelectorAll('article .bby-state')).find(function (item) { return item.dataset.state === select.value; });
    if (!state) return;
    var rows = [['BBY state startup checklist', document.title], ['State', select.value], ['Business / service scope', ''], ['Operating city, county and address', ''], ['Prepared on', ''], [], ['Requirement / question', 'Official source URL', 'Agency / contact', 'Confirmed answer or exemption', 'Application / permit name', 'Fee', 'Prerequisites', 'Next action', 'Due date', 'Renewal date', 'Status (unconfirmed / not required / pending / approved)']];
    state.querySelectorAll('a[href]').forEach(function (a) { rows.push([a.textContent.trim(), a.href, '', '', '', '', '', 'Confirm applicability and request current application', '', '', 'unconfirmed']); });
    document.querySelectorAll('article .bby-course-questions li').forEach(function (li) { rows.push([li.textContent.trim(), '', '', '', '', '', '', 'Obtain official answer for this business and location', '', '', 'unconfirmed']); });
    ['Entity / assumed business name registration', 'State and local business licenses', 'Professional / trade / establishment licenses', 'State tax accounts and sales-tax applicability', 'City / county zoning and home-occupation approval', 'Fire / building / health / occupancy inspections', 'Insurance and required bonds', 'Training / exams / background reviews', 'Contracts / disclosures / consent / recordkeeping', 'Out-of-state work and additional locations', 'Renewal calendar and ongoing reporting'].forEach(function (q) { rows.push([q, '', '', '', '', '', '', 'Confirm with responsible authority', '', '', 'unconfirmed']); });
    var csv = '\uFEFF' + rows.map(function (row) { return row.map(safeCell).join(','); }).join('\r\n');
    var url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8;'}));
    var a = document.createElement('a'); a.href = url;
    a.download = location.pathname.split('/').pop().replace('.html','') + '-' + select.value.toLowerCase().replace(/\s+/g,'-') + '-state-checklist.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });
  document.addEventListener('change', function (event) { if (event.target.id === 'bby-state-select') event.target.setCustomValidity(''); });
  var lesson = document.getElementById('lesson');
  if (lesson) new MutationObserver(restoreState).observe(lesson, {childList:true});
  restoreState();
})();
