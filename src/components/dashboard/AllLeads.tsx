import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import './LeadsDashboard.css';
import leadService from '../../services/leadService';

interface Lead {
  id: number;
  lead_id?: string;
  full_name: string;
  mobile_number: string;
  email_address?: string;
  city?: string;
  state?: string;
  lead_source: string;
  campaign_name?: string;
  ad_set_name?: string;
  ad_name?: string;
  vehicle_interest?: string;
  budget?: string;
  custom_fields?: Record<string, any>;
  status: string;
  is_hot: boolean;
  created_at: string;
  updated_at: string;
}

const AllLeads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [showHotOnly, setShowHotOnly] = useState(false);

  const [newLeadIds, setNewLeadIds] = useState<Set<number>>(new Set());
  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<number>>(new Set());

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncIsError, setSyncIsError] = useState(false);

  // Google Sheets state
  const [sheetsUrlInput, setSheetsUrlInput] = useState('');
  const [hasLoadedUrl, setHasLoadedUrl] = useState(false);
  const [isSheetsConfiguring, setIsSheetsConfiguring] = useState(false);
  const [sheetsConfig, setSheetsConfig] = useState<any>(null);
  const [sheetsError, setSheetsError] = useState<string | null>(null);
  const [sheetsSuccessMessage, setSheetsSuccessMessage] = useState<string | null>(null);

  const fetchSheetsConfig = async () => {
    try {
      const config = await leadService.getSheetsConfig();
      if (config && config.success) {
        setSheetsConfig(config.data);
        if (!hasLoadedUrl && config.data.url) {
          setSheetsUrlInput(config.data.url);
          setHasLoadedUrl(true);
        }
      }
    } catch (err) {
      console.error('Error fetching sheets config:', err);
    }
  };

  const handleSheetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSheetsConfiguring(true);
    setSheetsError(null);
    setSheetsSuccessMessage(null);
    try {
      const response = await leadService.saveSheetsConfig(sheetsUrlInput);
      if (response && response.success) {
        setSheetsSuccessMessage(response.message || 'Google Sheets configuration updated successfully.');
        setSheetsConfig(response.data);
        setSheetsUrlInput(response.data.url || '');
        await fetchLeads(false);
      } else {
        setSheetsError(response?.message || 'Failed to update Google Sheets configuration.');
      }
    } catch (err: any) {
      console.error('Error saving sheets config:', err);
      setSheetsError(err.message || 'Server error configuring Google Sheets.');
    } finally {
      setIsSheetsConfiguring(false);
      setTimeout(() => {
        setSheetsSuccessMessage(null);
        setSheetsError(null);
      }, 10000);
    }
  };

  const handleManualSheetsSync = async () => {
    setIsSheetsConfiguring(true);
    setSheetsError(null);
    setSheetsSuccessMessage(null);
    try {
      const response = await leadService.triggerSheetsSync();
      if (response && response.success) {
        setSheetsSuccessMessage(response.message || 'Manual synchronization complete.');
        setSheetsConfig(response.data);
        await fetchLeads(false);
      } else {
        setSheetsError(response?.message || 'Manual synchronization failed.');
      }
    } catch (err: any) {
      console.error('Error manual sheets sync:', err);
      setSheetsError(err.message || 'Server error triggering synchronization.');
    } finally {
      setIsSheetsConfiguring(false);
      setTimeout(() => {
        setSheetsSuccessMessage(null);
        setSheetsError(null);
      }, 10000);
    }
  };

  const handleSyncLeads = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const response = await leadService.syncExistingLeads();
      if (response && response.success) {
        const totalForms = response.synced_pages?.reduce((acc: number, p: any) => acc + (p.forms_checked || 0), 0) || 0;
        const failedPages = response.synced_pages?.filter((p: any) => p.error) || [];
        let message = `Synced ${totalForms} form(s) across ${response.synced_pages?.length || 0} page(s) — ${response.new_leads_saved} new leads imported.`;
        if (failedPages.length > 0) {
          const failedDetails = failedPages.map((p: any) => `"${p.name}": ${p.error}`).join(' | ');
          message += ` Warning: Sync failed for [${failedDetails}]. Regenerate your Facebook User Access Token and check required scopes.`;
        }
        setSyncIsError(false);
        setSyncMessage(message);
        await fetchLeads(false);
      } else {
        setSyncIsError(false);
        setSyncMessage(response?.message || 'Sync completed with warnings.');
      }
    } catch (err: any) {
      console.error('Error syncing leads:', err);
      setSyncIsError(true);
      setSyncMessage(`Sync failed: ${err.message || 'Server error during synchronization.'}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 20000);
    }
  };

  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorData, setSimulatorData] = useState({
    full_name: 'Rahul Sharma',
    mobile_number: '+91 98200 98200',
    email_address: 'rahul.sharma@gmail.com',
    city: 'Mumbai',
    state: 'Maharashtra',
    campaign_name: 'Festival Season Mega Discount Campaign',
    ad_set_name: 'Lookalike Mumbai SUV Buyers',
    ad_name: 'Safari Dark Edition Carousel Ad',
    vehicle_interest: 'Tata Safari Dark',
    budget: '₹18 Lakhs - ₹25 Lakhs',
    is_hot: true,
    custom_key: 'Requirement',
    custom_val: 'Needs delivery within 1 week'
  });

  const fetchLeads = async (isInitial = false) => {
    if (isInitial) setLeadsLoading(true);
    try {
      const data = await leadService.getLeads();
      setLeads(currentLeads => {
        if (!isInitial && currentLeads.length > 0) {
          const currentIds = new Set(currentLeads.map(l => l.id));
          const brandNewIds: number[] = [];
          data.forEach((lead: Lead) => {
            if (!currentIds.has(lead.id)) brandNewIds.push(lead.id);
          });
          if (brandNewIds.length > 0) {
            setNewLeadIds(prev => {
              const next = new Set(prev);
              brandNewIds.forEach(id => next.add(id));
              return next;
            });
            setTimeout(() => {
              setNewLeadIds(prev => {
                const next = new Set(prev);
                brandNewIds.forEach(id => next.delete(id));
                return next;
              });
            }, 15000);
          }
        }
        return data;
      });
      setLeadsError(null);
    } catch (err) {
      console.error('Error fetching leads:', err);
      if (isInitial) setLeadsError('Failed to connect to backend leads API.');
    } finally {
      if (isInitial) setLeadsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(true);
    fetchSheetsConfig();
    const interval = setInterval(() => {
      fetchLeads(false);
      // Retrieve fresh sheets config state logs
      leadService.getSheetsConfig()
        .then(config => {
          if (config && config.success) {
            setSheetsConfig(config.data);
            setHasLoadedUrl(loaded => {
              if (!loaded && config.data.url) {
                setSheetsUrlInput(config.data.url);
                return true;
              }
              return loaded;
            });
          }
        })
        .catch(err => console.error('Interval fetch config error:', err));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      });
    } catch { return isoString; }
  };

  const toggleExpand = (id: number) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      await leadService.updateLead(id, { status: newStatus });
    } catch (err) {
      console.error('Status change error:', err);
      setLeads(await leadService.getLeads());
    }
  };

  const handleToggleHot = async (id: number, currentVal: boolean) => {
    try {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, is_hot: !currentVal } : l));
      await leadService.updateLead(id, { is_hot: !currentVal });
    } catch (err) {
      console.error('Hot toggle error:', err);
      setLeads(await leadService.getLeads());
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!window.confirm('Permanently delete this lead?')) return;
    try {
      setLeads(prev => prev.filter(l => l.id !== id));
      await leadService.deleteLead(id);
    } catch (err) {
      console.error('Delete error:', err);
      setLeads(await leadService.getLeads());
    }
  };

  const dismissNewHighlight = (id: number) => {
    setNewLeadIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const custom_fields: Record<string, string> = {};
      if (simulatorData.custom_key && simulatorData.custom_val) {
        custom_fields[simulatorData.custom_key] = simulatorData.custom_val;
      }
      const payload = {
        full_name: simulatorData.full_name,
        mobile_number: simulatorData.mobile_number,
        email_address: simulatorData.email_address || undefined,
        city: simulatorData.city || undefined,
        state: simulatorData.state || undefined,
        campaign_name: simulatorData.campaign_name,
        ad_set_name: simulatorData.ad_set_name,
        ad_name: simulatorData.ad_name,
        vehicle_interest: simulatorData.vehicle_interest,
        budget: simulatorData.budget,
        is_hot: simulatorData.is_hot,
        custom_fields
      };
      await leadService.simulateWebhookLead(payload);
      setIsSimulatorOpen(false);
      const latest = await leadService.getLeads();
      setLeads(latest);
      const addedLead = latest.find((l: Lead) => l.mobile_number === payload.mobile_number && l.full_name === payload.full_name);
      if (addedLead) {
        setNewLeadIds(prev => { const next = new Set(prev); next.add(addedLead.id); return next; });
        setTimeout(() => {
          setNewLeadIds(prev => { const next = new Set(prev); next.delete(addedLead.id); return next; });
        }, 15000);
      }
      const firstNames = ['Amit', 'Sunil', 'Vijay', 'Karan', 'Pooja', 'Rohan', 'Sneha', 'Suresh', 'Manish'];
      const lastNames = ['Patel', 'Joshi', 'Mehta', 'Verma', 'Deshmukh', 'Chawla', 'Singh', 'Kulkarni'];
      const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Thane', 'Nashik'];
      const cars = ['Toyota Innova Crysta', 'Hyundai Creta', 'Tata Nexon EV', 'Maruti Swift Tour S', 'Mahindra XUV700'];
      const nF = firstNames[Math.floor(Math.random() * firstNames.length)];
      const nL = lastNames[Math.floor(Math.random() * lastNames.length)];
      setSimulatorData(prev => ({
        ...prev,
        full_name: `${nF} ${nL}`,
        mobile_number: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
        email_address: `${nF.toLowerCase()}.${nL.toLowerCase()}@gmail.com`,
        city: cities[Math.floor(Math.random() * cities.length)],
        vehicle_interest: cars[Math.floor(Math.random() * cars.length)],
        is_hot: Math.random() > 0.5
      }));
    } catch (err) {
      console.error('Simulate error:', err);
      alert('Failed to trigger simulated lead webhook.');
    } finally {
      setIsSimulating(false);
    }
  };

  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === 'New Lead').length;
  const hotCount = leads.filter(l => l.is_hot).length;
  const convertedCount = leads.filter(l => l.status === 'Converted').length;

  const uniqueCampaigns = Array.from(new Set(leads.map(l => l.campaign_name).filter(Boolean))) as string[];

  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.full_name.toLowerCase().includes(q) ||
      lead.mobile_number.includes(q) ||
      (lead.email_address?.toLowerCase().includes(q)) ||
      (lead.vehicle_interest?.toLowerCase().includes(q)) ||
      (lead.city?.toLowerCase().includes(q)) ||
      (lead.state?.toLowerCase().includes(q));
    return matchesSearch &&
      (statusFilter === 'All' || lead.status === statusFilter) &&
      (campaignFilter === 'All' || lead.campaign_name === campaignFilter) &&
      (!showHotOnly || lead.is_hot);
  });

  const statusClass = (s: string) => `status-dropdown-${s.toLowerCase().replace(/[\s-]/g, '')}`;

  return (
    <div className="leads-page">
      {/* Hero Header */}
      <div className="leads-page-header">
        <div className="leads-page-title">
          <div className="leads-title-row">
            <span className="leads-title-icon">🎯</span>
            <h1>Meta Campaign Leads</h1>
            <span className="live-dot" title="Live polling active" />
            <span className="sync-status-label meta-active-badge">📘 Meta Auto-Sync Active</span>
            {isSyncing && <span className="sync-status-label">Syncing...</span>}
          </div>
          <p className="leads-subtitle">
            Incoming leads from Facebook Meta ad campaigns · Auto-refreshes every 5s
          </p>
        </div>
        <div className="leads-header-actions">
          <button className="btn-leads btn-leads-outline" onClick={() => fetchLeads(false)} disabled={isSyncing}>
            ↻ Reload
          </button>
          <button className="btn-leads btn-leads-primary btn-sync" onClick={handleSyncLeads} disabled={isSyncing}>
            {isSyncing ? '⟳ Syncing...' : '⟳ Sync History'}
          </button>
          <button className="btn-leads btn-leads-secondary" onClick={() => setIsSimulatorOpen(true)}>
            ⚡ Simulate Lead
          </button>
        </div>
      </div>

      {/* ---- Content Area ---- */}
      <div className="leads-content-area">

      {/* Sync Message Banner */}
      {syncMessage && (
        <div className={`sync-banner ${syncIsError ? 'sync-banner-error' : 'sync-banner-success'}`}>
          <span>{syncMessage}</span>
          <button className="sync-banner-close" onClick={() => setSyncMessage(null)}>×</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="leads-metrics-strip">
        <div className="metric-card metric-card-total">
          <div className="metric-icon-wrap">📊</div>
          <div className="metric-body">
            <div className="metric-value">{leadsLoading ? '—' : totalCount}</div>
            <div className="metric-label">Total Leads</div>
          </div>
        </div>
        <div className="metric-card metric-card-new">
          <div className="metric-icon-wrap">✨</div>
          <div className="metric-body">
            <div className="metric-value">{leadsLoading ? '—' : newCount}</div>
            <div className="metric-label">New</div>
          </div>
        </div>
        <div className="metric-card metric-card-hot">
          <div className="metric-icon-wrap">🔥</div>
          <div className="metric-body">
            <div className="metric-value">{leadsLoading ? '—' : hotCount}</div>
            <div className="metric-label">Hot Leads</div>
          </div>
        </div>
        <div className="metric-card metric-card-converted">
          <div className="metric-icon-wrap">🏆</div>
          <div className="metric-body">
            <div className="metric-value">{leadsLoading ? '—' : convertedCount}</div>
            <div className="metric-label">Converted</div>
          </div>
        </div>
      </div>

      {/* Google Sheets Sync Card */}
      <div className="sheets-sync-card">
        <div className="sheets-card-header">
          <div className="sheets-card-title-group">
            <div className="sheets-icon-wrap">📊</div>
            <div>
              <h3>Google Sheets Auto-Sync</h3>
              <p className="sheets-card-desc">Automatically import leads from a public Google Spreadsheet every 30 seconds.</p>
            </div>
          </div>
          {sheetsConfig && sheetsConfig.url && (
            <div className="sheets-sync-status-badge">
              <span className={`status-indicator-dot ${sheetsConfig.lastSyncStatus === 'success' ? 'dot-success' : sheetsConfig.lastSyncStatus === 'syncing' ? 'dot-syncing' : 'dot-error'}`} />
              <span className="status-indicator-text">
                {sheetsConfig.lastSyncStatus === 'success' && 'Auto-Sync Active'}
                {sheetsConfig.lastSyncStatus === 'syncing' && 'Syncing now...'}
                {sheetsConfig.lastSyncStatus === 'error' && 'Sync Connection Error'}
                {sheetsConfig.lastSyncStatus === 'idle' && 'Pending Sync'}
                {!sheetsConfig.lastSyncStatus && 'Waiting...'}
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSheetsSubmit} className="sheets-config-form">
          <div className="sheets-input-wrapper">
            <input
              type="url"
              className="sheets-url-input"
              placeholder="Paste Google Sheets URL (e.g. https://docs.google.com/spreadsheets/d/...)"
              value={sheetsUrlInput}
              onChange={e => setSheetsUrlInput(e.target.value)}
              disabled={isSheetsConfiguring}
            />
            <button type="submit" className="btn-leads btn-leads-primary btn-sheets-save" disabled={isSheetsConfiguring}>
              {isSheetsConfiguring ? 'Connecting...' : sheetsConfig?.url ? 'Update Link' : 'Connect Sheet'}
            </button>
            {sheetsConfig && sheetsConfig.url && (
              <button 
                type="button" 
                className="btn-leads btn-leads-secondary btn-sheets-sync" 
                onClick={handleManualSheetsSync}
                disabled={isSheetsConfiguring}
              >
                Sync Now
              </button>
            )}
          </div>
          <p className="sheets-tip">
            <strong>Important:</strong> Google Sheet must be shared as <em>"Anyone with the link can view"</em>.
          </p>
        </form>

        {/* Status Logs / Errors */}
        {(sheetsSuccessMessage || sheetsError || (sheetsConfig && sheetsConfig.url)) && (
          <div className="sheets-sync-logs">
            {sheetsSuccessMessage && <div className="sheets-log-alert alert-success">{sheetsSuccessMessage}</div>}
            {sheetsError && <div className="sheets-log-alert alert-error">{sheetsError}</div>}
            {sheetsConfig && sheetsConfig.url && !sheetsSuccessMessage && !sheetsError && (
              <div className="sheets-log-details">
                <span className="log-item">
                  <strong>Sync Status:</strong>{' '}
                  <span className={`log-status-text text-${sheetsConfig.lastSyncStatus}`}>
                    {sheetsConfig.lastSyncStatus ? sheetsConfig.lastSyncStatus.toUpperCase() : 'PENDING'}
                  </span>
                </span>
                <span className="log-item">
                  <strong>Last Auto-Fetch:</strong>{' '}
                  {sheetsConfig.lastSyncTime ? formatDate(sheetsConfig.lastSyncTime) : 'Never'}
                </span>
                {sheetsConfig.lastSyncStatus === 'success' && (
                  <span className="log-item">
                    <strong>Last Saved Leads:</strong> {sheetsConfig.lastSyncedCount || 0}
                  </span>
                )}
                {sheetsConfig.lastSyncStatus === 'error' && (
                  <div className="log-error-detail">
                    <strong>Error details:</strong> {sheetsConfig.lastSyncError || 'Unknown connection error.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="leads-filter-bar">
        <input
          type="search"
          className="filter-search"
          placeholder="🔍  Search name, phone, email, vehicle..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="New Lead">New Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Follow-Up">Follow-Up</option>
          <option value="Interested">Interested</option>
          <option value="Converted">Converted</option>
          <option value="Closed">Closed</option>
          <option value="Not Interested">Not Interested</option>
        </select>
        <select className="filter-select" value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)}>
          <option value="All">All Campaigns</option>
          {uniqueCampaigns.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="filter-checkbox-label">
          <input type="checkbox" checked={showHotOnly} onChange={e => setShowHotOnly(e.target.checked)} />
          🔥 Hot Only
        </label>
        <span className="filter-count-badge">{filteredLeads.length} of {totalCount} shown</span>
      </div>

      {/* Table / States */}
      {leadsLoading && leads.length === 0 ? (
        <div className="leads-state-box">
          <div className="loading-spinner" />
          <p>Loading leads...</p>
        </div>
      ) : leadsError ? (
        <div className="leads-state-box leads-state-error">
          <span className="state-icon">!</span>
          <p>{leadsError}</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="leads-state-box">
          <span className="state-icon">∅</span>
          <p>No leads found matching the current filters.</p>
        </div>
      ) : (
        <div className="leads-table-wrap">
          <table className="leads-table">
            <thead>
              <tr>
                <th className="col-date">Date</th>
                <th className="col-name">Name</th>
                <th className="col-contact">Contact</th>
                <th className="col-campaign">Campaign</th>
                <th className="col-status">Status</th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map(lead => {
                const isNew = newLeadIds.has(lead.id);
                const isExpanded = expandedLeadIds.has(lead.id);
                const rowClass = [
                  'lead-row',
                  isNew ? 'lead-row-new' : '',
                  lead.is_hot ? 'lead-row-hot' : '',
                  isExpanded ? 'lead-row-open' : '',
                ].filter(Boolean).join(' ');

                return (
                  <React.Fragment key={lead.id}>
                    <tr className={rowClass}>
                      {/* Date */}
                      <td className="col-date">
                        <span className="cell-date">
                          <span className="cell-date-day">
                            {new Date(lead.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="cell-date-time">
                            {new Date(lead.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </span>
                      </td>

                      {/* Name */}
                      <td className="col-name">
                        <div className="name-cell">
                          <div className="name-info">
                            <span className="name-avatar">{(lead.full_name || '?').charAt(0).toUpperCase()}</span>
                            <span className="name-text">{lead.full_name}</span>
                          </div>
                          <div className="name-badges">
                            {lead.is_hot && <span className="badge badge-hot">Hot</span>}
                            {isNew && (
                              <span className="badge badge-new" onClick={() => dismissNewHighlight(lead.id)} title="Click to dismiss">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="col-contact">
                        <div className="contact-cell">
                          <a href={`tel:${lead.mobile_number}`} className="contact-link phone-pill">
                            <span className="phone-icon">📞</span> {lead.mobile_number}
                          </a>
                          {lead.email_address && (
                            <a href={`mailto:${lead.email_address}`} className="contact-email">
                              <span className="email-icon">✉️</span> {lead.email_address}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Campaign */}
                      <td className="col-campaign">
                        <div className="campaign-cell">
                          <span className="cell-campaign" title={lead.campaign_name}>
                            {lead.campaign_name || <span className="muted">—</span>}
                          </span>
                          <span className={`cell-source-badge ${lead.lead_source === 'Google Sheets' ? 'source-sheets' : lead.lead_source === 'Facebook Meta' ? 'source-meta' : 'source-direct'}`}>
                            {lead.lead_source === 'Google Sheets' ? '📊 Sheets' : lead.lead_source === 'Facebook Meta' ? '📘 Meta' : lead.lead_source || 'Direct'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="col-status">
                        <select
                          className={`status-select ${statusClass(lead.status)}`}
                          value={lead.status}
                          onChange={e => handleStatusChange(lead.id, e.target.value)}
                        >
                          <option value="New Lead">New Lead</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Follow-Up">Follow-Up</option>
                          <option value="Interested">Interested</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="col-actions">
                        <div className="action-cell">
                          <button
                            className={`act-btn act-hot ${lead.is_hot ? 'active' : ''}`}
                            onClick={() => handleToggleHot(lead.id, lead.is_hot)}
                            title={lead.is_hot ? 'Unmark Hot' : 'Mark as Hot'}
                          >
                            {lead.is_hot ? 'Hot' : 'Hot?'}
                          </button>
                          <button
                            className={`act-btn act-details ${isExpanded ? 'active' : ''}`}
                            onClick={() => toggleExpand(lead.id)}
                            title={isExpanded ? 'Collapse details' : 'Expand details'}
                          >
                            {isExpanded ? 'Hide' : 'Details'}
                          </button>
                          <button
                            className="act-btn act-delete"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Delete lead"
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr className="lead-detail-row">
                        <td colSpan={6}>
                          <div className="detail-panel">
                            <div className="detail-col">
                              <h5 className="detail-col-title">Ad Metadata</h5>
                              <dl className="detail-list">
                                <dt>Source</dt><dd>{lead.lead_source}</dd>
                                {lead.ad_set_name && <><dt>Ad Set</dt><dd>{lead.ad_set_name}</dd></>}
                                {lead.ad_name && <><dt>Ad Name</dt><dd>{lead.ad_name}</dd></>}
                                {lead.lead_id && <><dt>Meta Lead ID</dt><dd className="muted-mono">{lead.lead_id}</dd></>}
                              </dl>
                            </div>
                            <div className="detail-col">
                              <h5 className="detail-col-title">Custom Form Responses</h5>
                              {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 ? (
                                <dl className="detail-list">
                                  {Object.entries(lead.custom_fields).map(([k, v]) => (
                                    <React.Fragment key={k}><dt>{k}</dt><dd>{String(v)}</dd></React.Fragment>
                                  ))}
                                </dl>
                              ) : (
                                <span className="muted">No custom responses.</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      </div>{/* end leads-content-area */}

      {/* Simulator Drawer */}
      <div className={`sim-overlay ${isSimulatorOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setIsSimulatorOpen(false); }}>
        <div className="sim-drawer">
          <div className="sim-header">
            <span className="sim-title">Lead Simulator</span>
            <button className="sim-close" onClick={() => setIsSimulatorOpen(false)}>×</button>
          </div>
          <div className="sim-body">
            <p className="sim-desc">Simulates a Facebook lead form submission via webhook → Supabase.</p>
            <form onSubmit={handleSimulateSubmit} className="sim-form">
              <div className="sim-row">
                <div className="sim-field">
                  <label>Full Name</label>
                  <input type="text" required value={simulatorData.full_name}
                    onChange={e => setSimulatorData(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="sim-field">
                  <label>Mobile Number</label>
                  <input type="text" required value={simulatorData.mobile_number}
                    onChange={e => setSimulatorData(p => ({ ...p, mobile_number: e.target.value }))} />
                </div>
              </div>
              <div className="sim-field">
                <label>Email Address</label>
                <input type="email" value={simulatorData.email_address}
                  onChange={e => setSimulatorData(p => ({ ...p, email_address: e.target.value }))} />
              </div>
              <div className="sim-row">
                <div className="sim-field">
                  <label>City</label>
                  <input type="text" value={simulatorData.city}
                    onChange={e => setSimulatorData(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="sim-field">
                  <label>State</label>
                  <input type="text" value={simulatorData.state}
                    onChange={e => setSimulatorData(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>
              <div className="sim-field">
                <label>Campaign</label>
                <select value={simulatorData.campaign_name}
                  onChange={e => setSimulatorData(p => ({ ...p, campaign_name: e.target.value }))}>
                  <option>Festival Season Mega Discount Campaign</option>
                  <option>Tata EV SUV Launch 2026</option>
                  <option>Modi Hyundai Creta Premium Offer</option>
                  <option>Toyota Innova Fleet Operator Drive</option>
                </select>
              </div>
              <div className="sim-row">
                <div className="sim-field">
                  <label>Ad Set</label>
                  <input type="text" value={simulatorData.ad_set_name}
                    onChange={e => setSimulatorData(p => ({ ...p, ad_set_name: e.target.value }))} />
                </div>
                <div className="sim-field">
                  <label>Ad Name</label>
                  <input type="text" value={simulatorData.ad_name}
                    onChange={e => setSimulatorData(p => ({ ...p, ad_name: e.target.value }))} />
                </div>
              </div>
              <div className="sim-row">
                <div className="sim-field">
                  <label>Vehicle</label>
                  <select value={simulatorData.vehicle_interest}
                    onChange={e => setSimulatorData(p => ({ ...p, vehicle_interest: e.target.value }))}>
                    <option>Hyundai Creta</option>
                    <option>Toyota Innova Crysta</option>
                    <option>Tata Nexon EV</option>
                    <option>Tata Safari Dark</option>
                    <option>Maruti Suzuki Swift Tour S</option>
                  </select>
                </div>
                <div className="sim-field">
                  <label>Budget</label>
                  <select value={simulatorData.budget}
                    onChange={e => setSimulatorData(p => ({ ...p, budget: e.target.value }))}>
                    <option>₹5 Lakhs - ₹8 Lakhs</option>
                    <option>₹8 Lakhs - ₹12 Lakhs</option>
                    <option>₹12 Lakhs - ₹18 Lakhs</option>
                    <option>₹18 Lakhs - ₹25 Lakhs</option>
                    <option>Above ₹25 Lakhs</option>
                  </select>
                </div>
              </div>
              <label className="sim-hot-check">
                <input type="checkbox" checked={simulatorData.is_hot}
                  onChange={e => setSimulatorData(p => ({ ...p, is_hot: e.target.checked }))} />
                Mark as Hot Lead
              </label>
              <div className="sim-divider-label">Custom Field</div>
              <div className="sim-row">
                <div className="sim-field">
                  <label>Label</label>
                  <input type="text" value={simulatorData.custom_key} placeholder="e.g. Color Preference"
                    onChange={e => setSimulatorData(p => ({ ...p, custom_key: e.target.value }))} />
                </div>
                <div className="sim-field">
                  <label>Value</label>
                  <input type="text" value={simulatorData.custom_val} placeholder="e.g. Polar White"
                    onChange={e => setSimulatorData(p => ({ ...p, custom_val: e.target.value }))} />
                </div>
              </div>
              <button type="submit" disabled={isSimulating} className="btn-leads btn-leads-primary sim-submit">
                {isSimulating ? 'Submitting...' : 'Submit Simulated Lead'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLeads;
