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

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campaignFilter, setCampaignFilter] = useState('All');
  const [showHotOnly, setShowHotOnly] = useState(false);

  // Highlighting & Expansions
  const [newLeadIds, setNewLeadIds] = useState<Set<number>>(new Set());
  const [expandedLeadIds, setExpandedLeadIds] = useState<Set<number>>(new Set());

  // Simulator
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

  // Fetch leads on mount and configure polling
  const fetchLeads = async (isInitial = false) => {
    if (isInitial) {
      setLeadsLoading(true);
    }
    try {
      const data = await leadService.getLeads();
      setLeads(currentLeads => {
        // Compare only if there were previous leads to avoid highlighting everything on load
        if (!isInitial && currentLeads.length > 0) {
          const currentIds = new Set(currentLeads.map(l => l.id));
          const brandNewIds: number[] = [];

          data.forEach((lead: Lead) => {
            if (!currentIds.has(lead.id)) {
              brandNewIds.push(lead.id);
            }
          });

          if (brandNewIds.length > 0) {
            setNewLeadIds(prev => {
              const next = new Set(prev);
              brandNewIds.forEach(id => next.add(id));
              return next;
            });

            // Auto-dismiss highlight glow after 15 seconds
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
      if (isInitial) {
        setLeadsError('Failed to connect to backend leads API.');
      }
    } finally {
      if (isInitial) {
        setLeadsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLeads(true);

    // 5-second polling interval
    const interval = setInterval(() => {
      fetchLeads(false);
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoString;
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      await leadService.updateLead(id, { status: newStatus });
    } catch (err) {
      console.error('Error changing lead status:', err);
      // Revert to database state
      const latest = await leadService.getLeads();
      setLeads(latest);
    }
  };

  const handleToggleHot = async (id: number, currentVal: boolean) => {
    try {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === id ? { ...l, is_hot: !currentVal } : l));
      await leadService.updateLead(id, { is_hot: !currentVal });
    } catch (err) {
      console.error('Error toggling hot lead:', err);
      // Revert to database state
      const latest = await leadService.getLeads();
      setLeads(latest);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (window.confirm('Are you sure you want to permanently delete this lead?')) {
      try {
        setLeads(prev => prev.filter(l => l.id !== id));
        await leadService.deleteLead(id);
      } catch (err) {
        console.error('Error deleting lead:', err);
        const latest = await leadService.getLeads();
        setLeads(latest);
      }
    }
  };

  const dismissNewHighlight = (id: number) => {
    setNewLeadIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
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
      
      // Close drawer
      setIsSimulatorOpen(false);

      // Fetch immediately to show the lead
      const latest = await leadService.getLeads();
      setLeads(latest);

      // Find the simulated lead ID and highlight it
      const addedLead = latest.find((l: Lead) => l.mobile_number === payload.mobile_number && l.full_name === payload.full_name);
      if (addedLead) {
        setNewLeadIds(prev => {
          const next = new Set(prev);
          next.add(addedLead.id);
          return next;
        });

        setTimeout(() => {
          setNewLeadIds(prev => {
            const next = new Set(prev);
            next.delete(addedLead.id);
            return next;
          });
        }, 15000);
      }

      // Rotate random values for next simulation
      const firstNames = ['Amit', 'Sunil', 'Vijay', 'Karan', 'Pooja', 'Rohan', 'Sneha', 'Suresh', 'Manish'];
      const lastNames = ['Patel', 'Joshi', 'Mehta', 'Verma', 'Deshmukh', 'Chawla', 'Singh', 'Kulkarni'];
      const cities = ['Pune', 'Mumbai', 'Delhi', 'Bangalore', 'Ahmedabad', 'Thane', 'Nashik'];
      const cars = ['Toyota Innova Crysta', 'Hyundai Creta', 'Tata Nexon EV', 'Maruti Swift Tour S', 'Mahindra XUV700'];
      
      const nextFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const nextLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const nextFullName = `${nextFirstName} ${nextLastName}`;
      const nextPhone = `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`;
      
      setSimulatorData(prev => ({
        ...prev,
        full_name: nextFullName,
        mobile_number: nextPhone,
        email_address: `${nextFirstName.toLowerCase()}.${nextLastName.toLowerCase()}@gmail.com`,
        city: cities[Math.floor(Math.random() * cities.length)],
        vehicle_interest: cars[Math.floor(Math.random() * cars.length)],
        is_hot: Math.random() > 0.5
      }));

    } catch (err) {
      console.error('Failed to simulate lead submission:', err);
      alert('Failed to trigger simulated lead webhook.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Metrics
  const totalCount = leads.length;
  const newCount = leads.filter(l => l.status === 'New Lead').length;
  const hotCount = leads.filter(l => l.is_hot).length;
  const convertedCount = leads.filter(l => l.status === 'Converted').length;

  // Filter list
  const uniqueCampaigns = Array.from(
    new Set(leads.map(l => l.campaign_name).filter(Boolean))
  ) as string[];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.mobile_number.includes(searchQuery) ||
      (lead.email_address && lead.email_address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.vehicle_interest && lead.vehicle_interest.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.city && lead.city.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.state && lead.state.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesCampaign = campaignFilter === 'All' || lead.campaign_name === campaignFilter;
    const matchesHot = !showHotOnly || lead.is_hot;

    return matchesSearch && matchesStatus && matchesCampaign && matchesHot;
  });

  return (
    <div className="leads-management-page" style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div className="header-title">
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            📢 Meta Campaign Leads
            <span className="live-indicator" style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: '#2ec4b6', borderRadius: '50%', boxShadow: '0 0 0 0 rgba(46, 196, 182, 0.7)', animation: 'livePulse 1.5s infinite' }}></span>
          </h1>
          <p style={{ margin: '0.3rem 0 0 0', color: '#8395a7', fontSize: '0.9rem' }}>
            Monitor and sync incoming leads from Facebook Meta ad campaigns in real time
          </p>
        </div>
        <div className="leads-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-leads btn-leads-secondary" onClick={() => fetchLeads(false)}>
            🔄 Force Reload
          </button>
          <button className="btn-leads btn-leads-primary" onClick={() => setIsSimulatorOpen(true)}>
            📱 Simulate Lead Form
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="leads-metrics-grid">
        <div className="leads-metric-card">
          <span className="leads-metric-label">Total Leads</span>
          <span className="leads-metric-value">{leadsLoading ? '...' : totalCount}</span>
        </div>
        <div className="leads-metric-card new-metric">
          <span className="leads-metric-label">New Inquiries</span>
          <span className="leads-metric-value">{leadsLoading ? '...' : newCount}</span>
        </div>
        <div className="leads-metric-card hot-metric">
          <span className="leads-metric-label">Hot Leads 🔥</span>
          <span className="leads-metric-value">{leadsLoading ? '...' : hotCount}</span>
        </div>
        <div className="leads-metric-card">
          <span className="leads-metric-label">Converted</span>
          <span className="leads-metric-value">{leadsLoading ? '...' : convertedCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="leads-filters">
        <input
          type="text"
          className="leads-search-input"
          placeholder="Search leads by name, phone, city, vehicle..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
        <select
          className="leads-filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="New Lead">New Lead</option>
          <option value="Contacted">Contacted</option>
          <option value="Follow-Up">Follow-Up</option>
          <option value="Interested">Interested</option>
          <option value="Converted">Converted</option>
          <option value="Closed">Closed</option>
          <option value="Not Interested">Not Interested</option>
        </select>
        <select
          className="leads-filter-select"
          value={campaignFilter}
          onChange={e => setCampaignFilter(e.target.value)}
        >
          <option value="All">All Campaigns</option>
          {uniqueCampaigns.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label className="leads-filter-checkbox-label">
          <input
            type="checkbox"
            checked={showHotOnly}
            onChange={e => setShowHotOnly(e.target.checked)}
          />
          🔥 Hot Only
        </label>
      </div>

      {/* Leads Cards */}
      {leadsLoading && leads.length === 0 ? (
        <div className="dashboard-loading" style={{ minHeight: '200px' }}>
          <div className="loading-spinner"></div>
          <p>Loading active campaigns leads...</p>
        </div>
      ) : leadsError ? (
        <div className="leads-no-data" style={{ borderColor: '#ffc9c9', color: '#c92a2a' }}>
          <span className="leads-no-data-icon">⚠️</span>
          <p>{leadsError}</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="leads-no-data">
          <span className="leads-no-data-icon">📂</span>
          <p>No Meta leads found matching the criteria.</p>
        </div>
      ) : (
        <div className="leads-grid">
          {filteredLeads.map(lead => {
            const isNewHighlight = newLeadIds.has(lead.id);
            const isExpanded = expandedLeadIds.has(lead.id);
            
            return (
              <div 
                key={lead.id} 
                className={`lead-card ${isNewHighlight ? 'new-lead-pulse' : ''}`}
              >
                {isNewHighlight && (
                  <span 
                    className="new-lead-badge" 
                    onClick={() => dismissNewHighlight(lead.id)}
                    title="Click to dismiss highlight"
                  >
                    New Lead ✨ (Click to Dismiss)
                  </span>
                )}
                
                <div className="lead-card-header">
                  <div className="lead-meta-info">
                    <span className="lead-campaign-badge" title={lead.campaign_name}>
                      📢 {lead.campaign_name || 'Direct Meta Form'}
                    </span>
                    <span className="lead-submit-time">
                      {formatDateTime(lead.created_at)}
                    </span>
                  </div>
                  
                  <div className="lead-header-badges">
                    <span className={`lead-badge lead-badge-${lead.status.toLowerCase().replace(' ', '')}`}>
                      {lead.status}
                    </span>
                    {lead.is_hot && (
                      <span className="lead-hot-badge">
                        🔥 Hot Lead
                      </span>
                    )}
                  </div>
                </div>

                <div className="lead-card-body">
                  <div className="lead-primary-info">
                    <h3>{lead.full_name}</h3>
                    <div className="lead-contact-row">
                      <span>📞</span>
                      <a href={`tel:${lead.mobile_number}`}>{lead.mobile_number}</a>
                    </div>
                    {lead.email_address && (
                      <div className="lead-contact-row">
                        <span>✉️</span>
                        <a href={`mailto:${lead.email_address}`}>{lead.email_address}</a>
                      </div>
                    )}
                    {(lead.city || lead.state) && (
                      <div className="lead-location-row">
                        <span>📍</span>
                        <span>{[lead.city, lead.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>

                  <div className="lead-vehicle-callout">
                    <span>🚙 {lead.vehicle_interest || 'Not Specified'}</span>
                    {lead.budget && <small>Budget: {lead.budget}</small>}
                  </div>

                  <div className="lead-status-control">
                    <label>Update Lead Action</label>
                    <div className="lead-status-select-container">
                      <select
                        className={`lead-status-dropdown status-dropdown-${lead.status.toLowerCase().replace(' ', '')}`}
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
                      <button
                        className={`lead-action-toggle-hot ${lead.is_hot ? 'is-active' : ''}`}
                        onClick={() => handleToggleHot(lead.id, lead.is_hot)}
                        title={lead.is_hot ? 'Remove Hot status' : 'Mark as Hot Lead'}
                      >
                        🔥
                      </button>
                      <button 
                        className="lead-action-toggle-hot"
                        onClick={() => handleDeleteLead(lead.id)}
                        title="Delete Lead"
                        style={{ borderColor: '#ced4da', color: '#868e96' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <button 
                    className="lead-collapsible-btn"
                    onClick={() => toggleExpand(lead.id)}
                  >
                    {isExpanded ? '▼ Hide Campaign & Form Fields' : '▶ Show Campaign & Form Fields'}
                  </button>

                  {isExpanded && (
                    <div className="lead-collapsible-content">
                      <div className="lead-detail-item">
                        <strong>Source:</strong> {lead.lead_source}
                      </div>
                      {lead.ad_set_name && (
                        <div className="lead-detail-item">
                          <strong>Ad Set:</strong> {lead.ad_set_name}
                        </div>
                      )}
                      {lead.ad_name && (
                        <div className="lead-detail-item">
                          <strong>Ad Name:</strong> {lead.ad_name}
                        </div>
                      )}
                      {lead.lead_id && (
                        <div className="lead-detail-item">
                          <strong>Meta Lead ID:</strong> {lead.lead_id}
                        </div>
                      )}
                      {lead.custom_fields && Object.keys(lead.custom_fields).length > 0 && (
                        <>
                          <div className="lead-custom-fields-title">Form Submissions</div>
                          {Object.entries(lead.custom_fields).map(([key, val]) => (
                            <div key={key} className="lead-detail-item">
                              <strong>{key}:</strong> {String(val)}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Meta Lead Simulator Drawer */}
      <div className={`leads-simulator-overlay ${isSimulatorOpen ? 'is-open' : ''}`}>
        <div className="leads-simulator-drawer">
          <div className="leads-simulator-header">
            <h3>Meta Ad Lead Simulator</h3>
            <button className="btn-close-simulator" onClick={() => setIsSimulatorOpen(false)}>×</button>
          </div>
          <div className="leads-simulator-body">
            <p className="leads-simulator-description">
              Simulate a user submitting a Facebook Lead Form from an active Facebook campaign.
              This triggers the backend webhook, which will process the lead and save it in Supabase, updating the list in real-time.
            </p>
            <form onSubmit={handleSimulateSubmit}>
              <div className="simulator-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  required
                  value={simulatorData.full_name}
                  onChange={e => setSimulatorData(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>

              <div className="simulator-form-group">
                <label>Mobile Number</label>
                <input
                  type="text"
                  required
                  value={simulatorData.mobile_number}
                  onChange={e => setSimulatorData(prev => ({ ...prev, mobile_number: e.target.value }))}
                />
              </div>

              <div className="simulator-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={simulatorData.email_address}
                  onChange={e => setSimulatorData(prev => ({ ...prev, email_address: e.target.value }))}
                />
              </div>

              <div className="simulator-row-2">
                <div className="simulator-form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={simulatorData.city}
                    onChange={e => setSimulatorData(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="simulator-form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={simulatorData.state}
                    onChange={e => setSimulatorData(prev => ({ ...prev, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="simulator-form-group">
                <label>Facebook Campaign Name</label>
                <select
                  value={simulatorData.campaign_name}
                  onChange={e => setSimulatorData(prev => ({ ...prev, campaign_name: e.target.value }))}
                >
                  <option value="Festival Season Mega Discount Campaign">Festival Season Mega Discount Campaign</option>
                  <option value="Tata EV SUV Launch 2026">Tata EV SUV Launch 2026</option>
                  <option value="Modi Hyundai Creta Premium Offer">Modi Hyundai Creta Premium Offer</option>
                  <option value="Toyota Innova Fleet Operator Drive">Toyota Innova Fleet Operator Drive</option>
                </select>
              </div>

              <div className="simulator-form-group">
                <label>Ad Set Name</label>
                <input
                  type="text"
                  value={simulatorData.ad_set_name}
                  onChange={e => setSimulatorData(prev => ({ ...prev, ad_set_name: e.target.value }))}
                />
              </div>

              <div className="simulator-form-group">
                <label>Ad Name</label>
                <input
                  type="text"
                  value={simulatorData.ad_name}
                  onChange={e => setSimulatorData(prev => ({ ...prev, ad_name: e.target.value }))}
                />
              </div>

              <div className="simulator-row-2">
                <div className="simulator-form-group">
                  <label>Vehicle Interest</label>
                  <select
                    value={simulatorData.vehicle_interest}
                    onChange={e => setSimulatorData(prev => ({ ...prev, vehicle_interest: e.target.value }))}
                  >
                    <option value="Hyundai Creta">Hyundai Creta</option>
                    <option value="Toyota Innova Crysta">Toyota Innova Crysta</option>
                    <option value="Tata Nexon EV">Tata Nexon EV</option>
                    <option value="Tata Safari Dark">Tata Safari Dark</option>
                    <option value="Maruti Suzuki Swift Tour S">Maruti Suzuki Swift Tour S</option>
                  </select>
                </div>
                <div className="simulator-form-group">
                  <label>Budget Range</label>
                  <select
                    value={simulatorData.budget}
                    onChange={e => setSimulatorData(prev => ({ ...prev, budget: e.target.value }))}
                  >
                    <option value="₹5 Lakhs - ₹8 Lakhs">₹5 Lakhs - ₹8 Lakhs</option>
                    <option value="₹8 Lakhs - ₹12 Lakhs">₹8 Lakhs - ₹12 Lakhs</option>
                    <option value="₹12 Lakhs - ₹18 Lakhs">₹12 Lakhs - ₹18 Lakhs</option>
                    <option value="₹18 Lakhs - ₹25 Lakhs">₹18 Lakhs - ₹25 Lakhs</option>
                    <option value="Above ₹25 Lakhs">Above ₹25 Lakhs</option>
                  </select>
                </div>
              </div>

              <div className="simulator-form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={simulatorData.is_hot}
                    onChange={e => setSimulatorData(prev => ({ ...prev, is_hot: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Mark as Hot Lead 🔥
                </label>
              </div>

              <div className="lead-custom-fields-title" style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                Form Custom Field
              </div>
              <div className="simulator-row-2">
                <div className="simulator-form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    value={simulatorData.custom_key}
                    placeholder="e.g. Color Preference"
                    onChange={e => setSimulatorData(prev => ({ ...prev, custom_key: e.target.value }))}
                  />
                </div>
                <div className="simulator-form-group">
                  <label>User Input</label>
                  <input
                    type="text"
                    value={simulatorData.custom_val}
                    placeholder="e.g. Polar White"
                    onChange={e => setSimulatorData(prev => ({ ...prev, custom_val: e.target.value }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="btn-leads btn-leads-primary"
                style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center' }}
              >
                {isSimulating ? 'Submitting Form...' : '🚀 Submit Simulated Lead Form'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLeads;
