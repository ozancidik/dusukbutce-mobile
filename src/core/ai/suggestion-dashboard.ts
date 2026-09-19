/**
 * Suggestion Dashboard — UI/Report generation for suggestions
 * Displays pending suggestions with one-click approval/rejection
 */

import {
  Suggestion,
  getAutoApplicableSuggestions,
  getManualSuggestions,
  formatSuggestionForReport,
} from './suggestions';

export interface DashboardState {
  suggestions: Suggestion[];
  autoApplied: string[]; // Suggestion IDs
  approved: string[];
  rejected: Map<string, string>; // ID → rejection reason
}

/**
 * Create dashboard state
 */
export function createDashboardState(): DashboardState {
  return {
    suggestions: [],
    autoApplied: [],
    approved: [],
    rejected: new Map(),
  };
}

/**
 * Add suggestions to dashboard
 */
export function addSuggestionsToDashboard(
  state: DashboardState,
  suggestions: Suggestion[]
): void {
  state.suggestions.push(...suggestions);
}

/**
 * Approve a suggestion (user clicked approve)
 */
export function approveSuggestion(state: DashboardState, id: string): void {
  const idx = state.suggestions.findIndex((s) => s.id === id);
  if (idx >= 0) {
    state.suggestions[idx].status = 'approved';
    state.suggestions[idx].approvedBy = 'user';
    state.suggestions[idx].appliedAt = new Date();
    state.approved.push(id);
    state.rejected.delete(id);
  }
}

/**
 * Reject a suggestion with reason
 */
export function rejectSuggestion(
  state: DashboardState,
  id: string,
  reason: string
): void {
  const idx = state.suggestions.findIndex((s) => s.id === id);
  if (idx >= 0) {
    state.suggestions[idx].status = 'rejected';
    state.suggestions[idx].rejectionReason = reason;
    state.rejected.set(id, reason);
    const approvedIdx = state.approved.indexOf(id);
    if (approvedIdx >= 0) {
      state.approved.splice(approvedIdx, 1);
    }
  }
}

/**
 * Get suggestions grouped by status
 */
export function groupSuggestionsByStatus(
  state: DashboardState
): Record<string, Suggestion[]> {
  return {
    pending: state.suggestions.filter((s) => s.status === 'pending'),
    approved: state.suggestions.filter((s) => s.status === 'approved'),
    rejected: state.suggestions.filter((s) => s.status === 'rejected'),
    applied: state.suggestions.filter((s) => s.status === 'applied'),
  };
}

/**
 * Get statistics for dashboard
 */
export function getDashboardStats(state: DashboardState) {
  const grouped = groupSuggestionsByStatus(state);
  const autoApplicable = getAutoApplicableSuggestions(state.suggestions);
  const manualReview = getManualSuggestions(state.suggestions);

  return {
    total: state.suggestions.length,
    pending: grouped.pending.length,
    approved: grouped.approved.length,
    rejected: grouped.rejected.length,
    applied: grouped.applied.length,
    autoApplicable: autoApplicable.length,
    manualReview: manualReview.length,
    highRisk: state.suggestions.filter((s) => s.severity === 'high').length,
  };
}

/**
 * Generate HTML dashboard (for web interface)
 */
export function generateDashboardHTML(state: DashboardState): string {
  const stats = getDashboardStats(state);
  const grouped = groupSuggestionsByStatus(state);

  const riskBadge = (risk: string) => {
    const colors = {
      low: '#2ecc71',
      medium: '#f39c12',
      high: '#e74c3c',
    };
    return `<span style="background: ${colors[risk as keyof typeof colors]}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${risk.toUpperCase()}</span>`;
  };

  const statusBadge = (status: string) => {
    const colors = {
      pending: '#95a5a6',
      approved: '#2ecc71',
      rejected: '#e74c3c',
      applied: '#3498db',
    };
    return `<span style="background: ${colors[status as keyof typeof colors]}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${status.toUpperCase()}</span>`;
  };

  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Suggestion Dashboard</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
    .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-top: 15px; }
    .stat-card { background: #ecf0f1; padding: 15px; border-radius: 6px; text-align: center; }
    .stat-number { font-size: 24px; font-weight: bold; color: #2c3e50; }
    .stat-label { font-size: 12px; color: #7f8c8d; margin-top: 5px; }
    .section { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .suggestion-item { padding: 15px; border-left: 4px solid #3498db; margin-bottom: 10px; background: #f9f9f9; border-radius: 4px; }
    .suggestion-item:hover { background: #f0f0f0; }
    .suggestion-title { font-weight: 600; margin-bottom: 5px; }
    .suggestion-meta { font-size: 12px; color: #7f8c8d; margin-top: 8px; }
    .actions { margin-top: 10px; display: flex; gap: 8px; }
    .btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 600; }
    .btn-approve { background: #2ecc71; color: white; }
    .btn-reject { background: #e74c3c; color: white; }
    .btn-approve:hover { background: #27ae60; }
    .btn-reject:hover { background: #c0392b; }
    .empty { color: #7f8c8d; text-align: center; padding: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎛️ Suggestion Dashboard</h1>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${stats.total}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.pending}</div>
        <div class="stat-label">Pending</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.approved}</div>
        <div class="stat-label">Approved</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${stats.applied}</div>
        <div class="stat-label">Applied</div>
      </div>
    </div>
  </div>
`;

  // Pending suggestions
  if (grouped.pending.length > 0) {
    html += `<div class="section"><h2>⏳ Pending Approval (${grouped.pending.length})</h2>`;
    for (const s of grouped.pending) {
      html += `
      <div class="suggestion-item">
        <div class="suggestion-title">${s.title}</div>
        <div>${s.description}</div>
        <div class="suggestion-meta">
          ${riskBadge(s.severity)}
          Confidence: ${(s.confidence * 100).toFixed(0)}%
          Agent: ${s.agentSource}
        </div>
        <div class="actions">
          <button class="btn btn-approve" onclick="approveSuggestion('${s.id}')">✓ Approve</button>
          <button class="btn btn-reject" onclick="rejectSuggestion('${s.id}')">✗ Reject</button>
        </div>
      </div>
      `;
    }
    html += '</div>';
  }

  // Approved suggestions
  if (grouped.approved.length > 0) {
    html += `<div class="section"><h2>✅ Approved (${grouped.approved.length})</h2>`;
    for (const s of grouped.approved) {
      html += `
      <div class="suggestion-item" style="border-left-color: #2ecc71;">
        <div class="suggestion-title">${s.title}</div>
        <div class="suggestion-meta">${statusBadge('approved')} ${s.approvedBy}</div>
      </div>
      `;
    }
    html += '</div>';
  }

  // Applied suggestions
  if (grouped.applied.length > 0) {
    html += `<div class="section"><h2>🚀 Applied (${grouped.applied.length})</h2>`;
    for (const s of grouped.applied) {
      html += `
      <div class="suggestion-item" style="border-left-color: #3498db;">
        <div class="suggestion-title">${s.title}</div>
        <div class="suggestion-meta">${statusBadge('applied')} Files: ${s.files.join(', ')}</div>
      </div>
      `;
    }
    html += '</div>';
  }

  // Rejected suggestions
  if (grouped.rejected.length > 0) {
    html += `<div class="section"><h2>❌ Rejected (${grouped.rejected.length})</h2>`;
    for (const s of grouped.rejected) {
      html += `
      <div class="suggestion-item" style="border-left-color: #e74c3c;">
        <div class="suggestion-title">${s.title}</div>
        <div class="suggestion-meta">
          ${statusBadge('rejected')}
          Reason: ${s.rejectionReason || 'Not specified'}
        </div>
      </div>
      `;
    }
    html += '</div>';
  }

  if (grouped.pending.length === 0 && grouped.approved.length === 0) {
    html += '<div class="section"><div class="empty">✅ No suggestions to review</div></div>';
  }

  html += `
  <script>
    function approveSuggestion(id) {
      console.log('Approved:', id);
      alert('Suggestion ' + id + ' approved!');
    }
    function rejectSuggestion(id) {
      const reason = prompt('Rejection reason:');
      if (reason) {
        console.log('Rejected:', id, 'Reason:', reason);
        alert('Suggestion ' + id + ' rejected!');
      }
    }
  </script>
</body>
</html>
  `;

  return html;
}

/**
 * Generate markdown report for dashboard
 */
export function generateDashboardMarkdown(state: DashboardState): string {
  const stats = getDashboardStats(state);
  const grouped = groupSuggestionsByStatus(state);

  let md = `# 📊 Suggestion Dashboard Report

## Stats

| Metric | Count |
|--------|-------|
| Total Suggestions | ${stats.total} |
| Pending Approval | ${stats.pending} |
| Approved | ${stats.approved} |
| Applied | ${stats.applied} |
| Rejected | ${stats.rejected} |
| High Risk | ${stats.highRisk} |

## Pending Suggestions (${stats.pending})

`;

  if (grouped.pending.length === 0) {
    md += '✅ All suggestions reviewed!\n\n';
  } else {
    for (const s of grouped.pending.slice(0, 20)) {
      md += `### ${s.title}\n\n`;
      md += `- **Risk:** ${s.severity}\n`;
      md += `- **Confidence:** ${(s.confidence * 100).toFixed(0)}%\n`;
      md += `- **Agent:** ${s.agentSource}\n`;
      md += `- **Files:** ${s.files.join(', ')}\n\n`;
    }
    if (grouped.pending.length > 20) {
      md += `... and ${grouped.pending.length - 20} more\n\n`;
    }
  }

  return md;
}
