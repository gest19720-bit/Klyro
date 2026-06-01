// ─────────────────────────────────────────────────────────────────────
// app.js — Sidebar patch for Business tab
// In your renderSidebar() function, find the AI nav item and replace it
// ─────────────────────────────────────────────────────────────────────

// FIND this line (or similar) inside renderSidebar():
//   { icon: 'fa-brain',  label: 'AI',       href: 'ai.html'       },
// OR
//   <a href="ai.html" ...>AI</a>

// REPLACE WITH:
//   { icon: 'fa-briefcase', label: 'Business', href: 'business.html' },
// OR
//   <a href="business.html" ...>Business</a>

// ─────────────────────────────────────────────────────────────────────
// Quick find-replace (run from project root):
//   sed -i 's|ai\.html|business.html|g; s|fa-brain|fa-briefcase|g; s|"AI"|"Business"|g' app.js
//
// Then verify with:
//   grep -n "business\|Brain\|AI" app.js
// ─────────────────────────────────────────────────────────────────────
