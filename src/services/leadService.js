import apiService from './apiService';

class LeadService {
  // Fetch all Facebook Meta leads
  async getLeads() {
    try {
      const response = await apiService.get('/leads');
      return response.data || [];
    } catch (error) {
      console.error('Error in leadService.getLeads:', error);
      throw error;
    }
  }

  // Create a lead manually (direct API)
  async createLead(leadData) {
    try {
      const response = await apiService.post('/leads', leadData);
      return response.data;
    } catch (error) {
      console.error('Error in leadService.createLead:', error);
      throw error;
    }
  }

  // Update lead details/status/is_hot
  async updateLead(id, updates) {
    try {
      const response = await apiService.put(`/leads/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error in leadService.updateLead for ID ${id}:`, error);
      throw error;
    }
  }

  // Delete lead
  async deleteLead(id) {
    try {
      const response = await apiService.delete(`/leads/${id}`);
      return response;
    } catch (error) {
      console.error(`Error in leadService.deleteLead for ID ${id}:`, error);
      throw error;
    }
  }
  // Sync and fetch historical leads from Meta Leadgen Forms
  async syncExistingLeads() {
    try {
      const response = await apiService.post('/leads/sync');
      return response;
    } catch (error) {
      console.error('Error in leadService.syncExistingLeads:', error);
      throw error;
    }
  }
  // Simulate Facebook Meta Webhook submission (end-to-end testing)
  async simulateWebhookLead(leadData) {
    try {
      const randomLeadGenId = 'sim_' + Math.floor(Math.random() * 1000000000000);
      
      const payload = {
        object: 'page',
        entry: [
          {
            id: '1092837465615243',
            time: Math.floor(Date.now() / 1000),
            changes: [
              {
                field: 'leadgen',
                value: {
                  ad_id: leadData.ad_id || '2385920384750293',
                  form_id: leadData.form_id || '9485720384950293',
                  leadgen_id: randomLeadGenId,
                  created_time: Math.floor(Date.now() / 1000),
                  page_id: '1092837465615243',
                  adgroup_id: leadData.adgroup_id || '2385920384750200',
                  is_simulated: true,
                  simulated_data: {
                    full_name: leadData.full_name,
                    mobile_number: leadData.mobile_number,
                    email_address: leadData.email_address,
                    city: leadData.city,
                    state: leadData.state,
                    campaign_name: leadData.campaign_name || 'Meta Active Ad Campaign',
                    ad_set_name: leadData.ad_set_name || 'Main Ad Set',
                    ad_name: leadData.ad_name || 'Lead Form Video Ad',
                    vehicle_interest: leadData.vehicle_interest || 'General Inquiry',
                    budget: leadData.budget || 'N/A',
                    custom_fields: leadData.custom_fields || {},
                    is_hot: leadData.is_hot || false
                  }
                }
              }
            ]
          }
        ]
      };

      console.log('Sending simulated Meta Webhook payload:', payload);
      const response = await apiService.post('/leads/webhook', payload);
      return { success: true, leadgen_id: randomLeadGenId, response };
    } catch (error) {
      console.error('Error simulating webhook lead:', error);
      throw error;
    }
  }

  // Get current Google Sheets sync configuration & status
  async getSheetsConfig() {
    try {
      const response = await apiService.get('/leads/sheets-config');
      return response.data || null;
    } catch (error) {
      console.error('Error in leadService.getSheetsConfig:', error);
      throw error;
    }
  }

  // Update Google Sheets URL and run initial sync
  async saveSheetsConfig(url) {
    try {
      const response = await apiService.post('/leads/sheets-config', { url });
      return response;
    } catch (error) {
      console.error('Error in leadService.saveSheetsConfig:', error);
      throw error;
    }
  }

  // Manually trigger Google Sheets synchronization
  async triggerSheetsSync() {
    try {
      const response = await apiService.post('/leads/sheets-config/sync');
      return response;
    } catch (error) {
      console.error('Error in leadService.triggerSheetsSync:', error);
      throw error;
    }
  }
}

const leadService = new LeadService();
export default leadService;
