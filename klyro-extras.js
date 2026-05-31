/**
 * Klyro Extras — klyro-extras.js
 * 1. Tiny stick figure animations (SVG, CSS-driven)
 * 2. Plan-based feature gating
 */

'use strict';

/* ═══════════════════════════════════════════════
   PLAN SYSTEM
   Plans: free | starters | believers | trusts
   Each feature key maps to minimum plan required.
═══════════════════════════════════════════════ */
const PLAN_RANKS = { free: 0, starters: 1, believers: 2, trusts: 3 };

const PLAN_FEATURES = {
  ai_chat:            'starters',
  ai_web_search:      'believers',
  export_csv:         'believers',
  export_pdf:         'believers',
  savings_goals:      'believers',
  advanced_analysis:  'believers',
  unlimited_txns:     'believers',
  family_account:     'trusts',
  wealth_forecast:    'trusts',
  priority_support:   'trusts',
  custom_categories:  'believers',
};

const PLAN_TXN_LIMITS = { free: 20, starters: 60, believers: Infinity, trusts: Infinity };

const Plans = {
  getCurrentPlan() {
    try { return Store.getSettings().plan || 'free'; } catch { return 'free'; }
  },
  hasFeature(featureKey) {
    const cur = this.getCurrentPlan();
    const required = PLAN_FEATURES[featureKey] || 'free';
    return PLAN_RANKS[cur] >= PLAN_RANKS[required];
  },
  getTxnLimit() {
    return PLAN_TXN_LIMITS[this.getCurrentPlan()] || 20;
  },
  canAddTransaction() {
    try {
      const count = Store.getTransactions().length;
      return count < this.getTxnLimit();
    } catch { return true; }
  },
  getPlanLabel() {
    const labels = { free: 'Free', starters: 'Starter', believers: 'Believers', trusts: 'Trusts' };
    return labels[this.getCurrentPlan()] || 'Free';
  },
  getPlanEmoji() {
    const emojis = { free: '🆓', starters: '🌱', believers: '⭐', trusts: '👑' };
    return emojis[this.getCurrentPlan()] || '🆓';
  }
};

/* ═══════════════════════════════════════════════
   PLAN GATE — renders a lock overlay on features
   the user's current plan doesn't include.
   Call: PlanGate.lock(element, featureKey, label)
═══════════════════════════════════════════════ */
const PlanGate = {
  /* Wrap an element with a plan-gate overlay */
  lock(el, featureKey, label = 'Upgrade to unlock') {
    if (!el) return;
    if (Plans.hasFeature(featureKey)) return; // already unlocked

    el.style.position = 'relative';
    el.style.overflow = 'hidden';

    const required = PLAN_FEATURES[featureKey] || 'free';
    const planName = required.charAt(0).toUpperCase() + required.slice(1);

    // Blur the content slightly
    const inner = el.querySelector('.plan-gate-inner') || el.firstElementChild;
    if (inner) inner.style.filter = 'blur(4px) grayscale(0.5)';
    inner && (inner.style.userSelect = 'none');
    inner && (inner.style.pointerEvents = 'none');

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'plan-gate-overlay';
    overlay.innerHTML = `
      <div class="plan-gate-box">
        <div class="plan-gate-stick" id="gate-stick-${featureKey}"></div>
        <div class="plan-gate-lock"><i class="fas fa-lock"></i></div>
        <div class="plan-gate-title">${label}</div>
        <div class="plan-gate-sub">Available on <strong>${planName}</strong> plan</div>
        <a href="pricing.html" class="btn btn-gold btn-sm plan-gate-btn">
          <i class="fas fa-rocket"></i> Upgrade
        </a>
      </div>`;
    el.appendChild(overlay);

    // Animate a stick figure in the overlay
    setTimeout(() => StickFigures.render(`#gate-stick-${featureKey}`, 'shrug', 44), 200);
  },

  /* Block a button action */
  blockButton(btn, featureKey, label) {
    if (!btn) return;
    if (Plans.hasFeature(featureKey)) return;
    const required = PLAN_FEATURES[featureKey] || 'free';
    const planName = required.charAt(0).toUpperCase() + required.slice(1);
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      showToast(`${label || 'This feature'} requires the ${planName} plan. <a href="pricing.html" style="color:var(--gold)">Upgrade →</a>`, 'error');
    });
    btn.classList.add('plan-locked-btn');
    btn.title = `Requires ${planName} plan`;
  },

  /* Show plan badge in sidebar */
  renderBadge() {
    const plan = Plans.getCurrentPlan();
    const existing = document.querySelector('.plan-badge');
    if (existing) existing.remove();
    const sidebar = document.querySelector('.sidebar-bottom');
    if (!sidebar) return;
    const badge = document.createElement('div');
    badge.className = 'plan-badge';
    badge.innerHTML = `
      <span class="plan-badge-dot"></span>
      ${Plans.getPlanEmoji()} ${Plans.getPlanLabel()} Plan
      ${plan === 'free' || plan === 'starters' ? `<a href="pricing.html" class="plan-badge-upgrade">Upgrade</a>` : ''}`;
    sidebar.prepend(badge);
  },

  /* Enforce txn limit */
  enforceTxnLimit() {
    if (!Plans.canAddTransaction()) {
      const plan = Plans.getCurrentPlan();
      const limit = Plans.getTxnLimit();
      showToast(`You've hit the ${limit} transaction limit on the ${Plans.getPlanLabel()} plan. Upgrade to add more!`, 'error');
      return false;
    }
    return true;
  }
};

/* ═══════════════════════════════════════════════
   STICK FIGURES
   Tiny SVG stick figures with CSS keyframe
   animations. Rendered into a target element.
   Poses: wave | run | dance | shrug | celebrate
         | think | sit | fall | point | walk
═══════════════════════════════════════════════ */
const StickFigures = {

  /* Base dimensions */
  W: 48, H: 56,

  /* Inline SVG bodies per pose — all paths drawn at 48×56 viewBox */
  poses: {

    wave: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="34" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="14" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="34" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="22" x2="12" y2="18" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left" style="transform-origin:24px 22px"/>
      <line x1="24" y1="22" x2="40" y2="12" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right" style="transform-origin:24px 22px"/>`,

    run: (c) => `
      <circle cx="24" cy="7" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="13" x2="22" y2="30" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="22" y1="30" x2="30" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-right"/>
      <line x1="22" y1="30" x2="12" y2="42" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-left"/>
      <line x1="24" y1="18" x2="10" y2="24" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="24" y1="18" x2="36" y2="14" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>`,

    dance: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="33" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="33" x2="14" y2="48" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-left"/>
      <line x1="24" y1="33" x2="36" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-right"/>
      <line x1="24" y1="20" x2="8"  y2="12" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="24" y1="20" x2="40" y2="12" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>`,

    shrug: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="34" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="15" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="33" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="10" y2="26" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="10" y1="26" x2="6"  y2="20" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="38" y2="26" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>
      <line x1="38" y1="26" x2="42" y2="20" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,

    celebrate: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="33" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="33" x2="15" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="33" x2="33" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="8"  y2="8"  stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="24" y1="20" x2="40" y2="8"  stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>
      <circle cx="8" cy="6" r="3" fill="${c}" class="sf-confetti"/>
      <circle cx="40" cy="6" r="3" fill="${c}" class="sf-confetti"/>`,

    think: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="34" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="16" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="32" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="22" x2="12" y2="22" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="22" x2="36" y2="18" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>
      <line x1="36" y1="18" x2="34" y2="14" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="36" cy="2"  r="2" fill="${c}" opacity="0.6"/>
      <circle cx="40" cy="6"  r="1.5" fill="${c}" opacity="0.4"/>
      <circle cx="43" cy="1"  r="1.2" fill="${c}" opacity="0.25"/>`,

    sit: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="30" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="30" x2="10" y2="30" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="10" y1="30" x2="10" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="30" x2="38" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="12" y2="26" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="36" y2="24" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>`,

    point: (c) => `
      <circle cx="24" cy="8" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="14" x2="24" y2="34" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="16" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="34" x2="32" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="10" y2="24" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="20" x2="44" y2="14" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>`,

    walk: (c) => `
      <circle cx="24" cy="7" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="13" x2="24" y2="32" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="32" x2="16" y2="46" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-left"/>
      <line x1="24" y1="32" x2="32" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-right"/>
      <line x1="24" y1="20" x2="13" y2="28" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="24" y1="20" x2="35" y2="26" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>`,

    jump: (c) => `
      <circle cx="24" cy="6" r="6" fill="none" stroke="${c}" stroke-width="2.2"/>
      <line x1="24" y1="12" x2="24" y2="30" stroke="${c}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="24" y1="30" x2="14" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-left"/>
      <line x1="24" y1="30" x2="34" y2="44" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-leg-right"/>
      <line x1="24" y1="18" x2="8"  y2="10" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-left"/>
      <line x1="24" y1="18" x2="40" y2="10" stroke="${c}" stroke-width="2.2" stroke-linecap="round" class="sf-arm-right"/>`,
  },

  /* Animation classes per pose */
  animClass: {
    wave:      'sf-anim-wave',
    run:       'sf-anim-run',
    dance:     'sf-anim-dance',
    shrug:     'sf-anim-shrug',
    celebrate: 'sf-anim-celebrate',
    think:     'sf-anim-think',
    sit:       'sf-anim-idle',
    point:     'sf-anim-point',
    walk:      'sf-anim-walk',
    jump:      'sf-anim-jump',
  },

  /* Render into a CSS selector or DOM element */
  render(target, pose = 'wave', size = 48) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    const isDark = document.body.classList.contains('dark');
    const color = isDark ? 'rgba(212,160,23,0.85)' : 'rgba(100,80,40,0.8)';
    const poseEl = this.poses[pose] || this.poses.wave;
    const animClass = this.animClass[pose] || 'sf-anim-idle';
    const scale = size / 48;
    el.innerHTML = `
      <svg class="stick-figure ${animClass}" 
           viewBox="0 0 48 56" 
           width="${size}" height="${Math.round(56 * scale)}"
           xmlns="http://www.w3.org/2000/svg"
           aria-hidden="true">
        ${poseEl(color)}
      </svg>`;
  },

  /* Render multiple in a row */
  renderRow(target, poses, size = 36) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    el.innerHTML = poses.map(() => `<span class="sf-slot"></span>`).join('');
    el.querySelectorAll('.sf-slot').forEach((slot, i) => {
      if (poses[i]) this.render(slot, poses[i], size);
    });
  },

  /* Attach a hover-triggered animation to any element */
  attachHover(triggerEl, containerEl, pose = 'wave', size = 36) {
    if (!triggerEl) return;
    // Create a tooltip-like figure that appears on hover
    const wrapper = document.createElement('div');
    wrapper.className = 'sf-hover-badge';
    wrapper.style.cssText = `position:absolute;pointer-events:none;z-index:9999;opacity:0;transition:opacity 0.2s ease,transform 0.3s cubic-bezier(0.16,1,0.3,1);transform:translateY(8px)`;
    document.body.appendChild(wrapper);
    this.render(wrapper, pose, size);

    triggerEl.style.position = 'relative';
    triggerEl.addEventListener('mouseenter', () => {
      const rect = triggerEl.getBoundingClientRect();
      wrapper.style.left = (rect.left + rect.width / 2 - size / 2 + window.scrollX) + 'px';
      wrapper.style.top  = (rect.top - Math.round(56 * size / 48) - 8 + window.scrollY) + 'px';
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });
    triggerEl.addEventListener('mouseleave', () => {
      wrapper.style.opacity = '0';
      wrapper.style.transform = 'translateY(8px)';
    });
  }
};

/* ═══════════════════════════════════════════════
   KLYRO INTERACTIONS
   Wires stick figures to specific UI moments.
═══════════════════════════════════════════════ */
const KlyroInteractions = {

  /* Call once per page after DOM is ready */
  init() {
    this._injectEmptyStates();
    this._wireQuickAdd();
    this._wireNavItems();
    this._wireStatCards();
    this._wireTransactionItems();
    this._wireButtons();
    PlanGate.renderBadge();
    this._applyPlanGates();
  },

  /* Replace empty states with a stick figure */
  _injectEmptyStates() {
    document.querySelectorAll('.empty-state').forEach(el => {
      if (el.querySelector('.stick-figure')) return; // already has one
      const sfSlot = document.createElement('div');
      sfSlot.className = 'sf-empty-slot';
      el.prepend(sfSlot);
      StickFigures.render(sfSlot, 'sit', 44);
    });
  },

  /* Quick add transaction — celebrate on success */
  _wireQuickAdd() {
    const addBtn = document.querySelector('[onclick="quickAdd()"]') || document.querySelector('#modal-save-btn');
    if (addBtn) {
      // Limit check is woven into quickAdd via plan gate below
    }
  },

  /* Nav items — walking figure on hover */
  _wireNavItems() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
      StickFigures.attachHover(item, item, 'walk', 32);
    });
    document.querySelectorAll('.bottom-nav-item[data-page]').forEach(item => {
      StickFigures.attachHover(item, item, 'run', 28);
    });
  },

  /* Stat cards — celebrate on click */
  _wireStatCards() {
    document.addEventListener('click', e => {
      const card = e.target.closest('.stat-card');
      if (!card) return;
      // Temporarily show a celebrate figure inside the card
      let slot = card.querySelector('.sf-card-react');
      if (!slot) {
        slot = document.createElement('div');
        slot.className = 'sf-card-react';
        card.appendChild(slot);
      }
      StickFigures.render(slot, 'celebrate', 32);
      slot.style.opacity = '1';
      setTimeout(() => { slot.style.opacity = '0'; }, 1800);
    });
  },

  /* Transaction items — wave on hover */
  _wireTransactionItems() {
    document.addEventListener('mouseenter', e => {
      const item = e.target.closest('.txn-item');
      if (!item || item.dataset.sfWired) return;
      item.dataset.sfWired = '1';
      StickFigures.attachHover(item, item, 'wave', 28);
    }, true);
  },

  /* Buttons — point figure on hover */
  _wireButtons() {
    document.querySelectorAll('.btn-gold').forEach(btn => {
      StickFigures.attachHover(btn, btn, 'jump', 30);
    });
  },

  /* Apply plan gates to locked sections */
  _applyPlanGates() {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';

    // AI Chat page
    if (page.includes('ai')) {
      if (!Plans.hasFeature('ai_chat')) {
        PlanGate.lock(document.querySelector('.glass-card'), 'ai_chat', 'AI Chat');
      }
    }

    // Analysis page — advanced section
    if (page.includes('analysis')) {
      if (!Plans.hasFeature('advanced_analysis')) {
        const bottomRow = document.getElementById('bottom-row');
        if (bottomRow) PlanGate.lock(bottomRow, 'advanced_analysis', 'AI Suggestions & Breakdown');
      }
    }

    // Transactions — export button
    if (page.includes('transactions')) {
      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) PlanGate.blockButton(exportBtn, 'export_csv', 'CSV Export');
    }

    // Dashboard — goals section
    if (page.includes('dashboard') || page === '' || page.includes('index')) {
      // Savings goals
      const goalsEl = document.getElementById('goals-section');
      if (goalsEl && !Plans.hasFeature('savings_goals')) {
        PlanGate.lock(goalsEl, 'savings_goals', 'Savings Goals');
      }
    }

    // Settings — currency conversion (Believers+)
    if (page.includes('settings')) {
      if (!Plans.hasFeature('custom_categories')) {
        const convBtn = document.getElementById('open-conversion-modal');
        if (convBtn) PlanGate.blockButton(convBtn, 'custom_categories', 'Currency Conversion');
      }
    }
  }
};

/* ═══════════════════════════════════════════════
   TOAST CELEBRATION — fire stick figures from toast
═══════════════════════════════════════════════ */
const _origShowToast = window.showToast;
if (typeof _origShowToast === 'function') {
  window.showToast = function(msg, type = 'success') {
    _origShowToast(msg, type);
    if (type === 'success') {
      // Spawn a tiny celebrate figure near the toast
      let sfToast = document.getElementById('sf-toast-figure');
      if (!sfToast) {
        sfToast = document.createElement('div');
        sfToast.id = 'sf-toast-figure';
        sfToast.style.cssText = 'position:fixed;bottom:90px;right:32px;z-index:99999;opacity:0;transition:opacity 0.3s ease,transform 0.4s cubic-bezier(0.16,1,0.3,1);transform:translateY(20px);pointer-events:none;';
        document.body.appendChild(sfToast);
      }
      StickFigures.render(sfToast, 'celebrate', 36);
      sfToast.style.opacity = '1';
      sfToast.style.transform = 'translateY(0)';
      setTimeout(() => { sfToast.style.opacity = '0'; sfToast.style.transform = 'translateY(20px)'; }, 2800);
    }
  };
}

/* ═══════════════════════════════════════════════
   AUTO-INIT on DOMContentLoaded
═══════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => KlyroInteractions.init());
} else {
  // DOM already loaded (script injected late)
  setTimeout(() => KlyroInteractions.init(), 100);
}
