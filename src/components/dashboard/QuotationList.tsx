import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.css';
import quotationService from '../../services/quotationService';
import { generateQuotationPDF } from '../../utils/quotationPdfGenerator';

interface QuotationData {
  vendor_id: string;
  car_model: string;
  model_variant: string;
  roi_emi_interest: number;
  sbi_bank: number;
  union_bank: number;
  mahindra_finance: number;
  cholamandalam_bank: number;
  au_bank: number;
  ex_showroom: number;
  tcs: number;
  registration: number;
  insurance: number;
  number_plate_crtm_autocard: number;
  gps: number;
  fastag: number;
  speed_governor: number;
  accessories: number;
  on_the_road: number;
  loan_amount: number;
  margin_down_payment: number;
  process_fee: number;
  stamp_duty: number;
  handling_document_charge: number;
  loan_suraksha_insurance: number;
  down_payment: number;
  offers: number;
  final_down_payment: number;
  emi_years: number;
  monthly_emi: number;
  created_at: string;
  updated_at: string;
}

// Car variants data for dropdowns
const carVariants = {
  'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
  'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
  'TOYOTA RUMION': ['S CNG 1.5 MT'],
  'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
  'Maruti Suzuki Dzire': ['Tour\'s CNG'],
  'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

const QuotationList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [quotations, setQuotations] = useState<QuotationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<QuotationData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<QuotationData>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Check for success message from location state
  useEffect(() => {
    if (location.state?.success && location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location.state]);

  // Fetch quotations on component mount
  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await quotationService.getAllQuotations();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching quotations:', error);
      setError('Failed to load quotations. Please try again.');
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuotation = (quotation: QuotationData) => {
    setSelectedQuotation(quotation);
    setIsDetailModalOpen(true);
  };

  const handleEditQuotation = (quotation: QuotationData) => {
    setSelectedQuotation(quotation);
    setEditFormData({ ...quotation });
    setIsEditModalOpen(true);
  };

  const handleDeleteQuotation = (quotation: QuotationData) => {
    setSelectedQuotation(quotation);
    setIsDeleteModalOpen(true);
  };

  const handleDownloadQuotation = (quotation: QuotationData) => {
    generateQuotationPDF(quotation);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedQuotation(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedQuotation(null);
    setEditFormData({});
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedQuotation(null);
  };

  const handleEditFormChange = (field: keyof QuotationData, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateQuotation = async () => {
    if (!selectedQuotation || !editFormData) return;
    
    setUpdateLoading(true);
    try {
      await quotationService.updateQuotation(selectedQuotation.vendor_id, editFormData);
      setSuccessMessage(`Quotation ${selectedQuotation.vendor_id} updated successfully!`);
      closeEditModal();
      fetchQuotations(); // Refresh the list
    } catch (error) {
      console.error('Error updating quotation:', error);
      setError(`Failed to update quotation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuotation) return;
    
    setDeleteLoading(true);
    try {
      await quotationService.deleteQuotation(selectedQuotation.vendor_id);
      setSuccessMessage(`Quotation ${selectedQuotation.vendor_id} deleted successfully!`);
      closeDeleteModal();
      fetchQuotations(); // Refresh the list
    } catch (error) {
      console.error('Error deleting quotation:', error);
      setError(`Failed to delete quotation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Enhanced precise search function with better relevance scoring
  const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
    if (!searchTerm || !targetText) return false;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const targetLower = targetText.toLowerCase();
    
    // 1. Exact match (highest priority)
    if (targetLower === searchLower) return true;
    
    // 2. Direct substring match (high priority)
    if (targetLower.includes(searchLower)) return true;
    
    // 3. Word boundary matches (medium-high priority)
    const searchWords = searchLower.split(/\s+/);
    const targetWords = targetLower.split(/\s+/);
    
    // Check if all search words are found in target words
    const allWordsFound = searchWords.every(searchWord => 
      targetWords.some(targetWord => 
        targetWord.includes(searchWord) || searchWord.includes(targetWord)
      )
    );
    
    if (allWordsFound) return true;
    
    // 4. Normalized matching (remove separators) - but still strict
    const normalizeText = (text: string) => 
      text.replace(/[-_\s\.]/g, '').toLowerCase();
    
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedTarget = normalizeText(targetText);
    
    // Only proceed with normalization if search term is reasonable length
    if (normalizedSearch.length >= 3) {
      if (normalizedTarget.includes(normalizedSearch)) return true;
    }
    
    // 5. Very strict character sequence matching (only for longer terms)
    if (normalizedSearch.length >= 4) {
      let searchIndex = 0;
      let consecutiveMatches = 0;
      let maxConsecutiveMatches = 0;
      
      for (let i = 0; i < normalizedTarget.length && searchIndex < normalizedSearch.length; i++) {
        if (normalizedTarget[i] === normalizedSearch[searchIndex]) {
          searchIndex++;
          consecutiveMatches++;
          maxConsecutiveMatches = Math.max(maxConsecutiveMatches, consecutiveMatches);
        } else {
          consecutiveMatches = 0;
        }
      }
      
      // Much stricter requirements:
      // - Must match at least 85% of characters in order
      // - Must have at least 3 consecutive character matches
      const matchRatio = searchIndex / normalizedSearch.length;
      return matchRatio >= 0.85 && maxConsecutiveMatches >= 3;
    }
    
    return false;
  };

  // Calculate relevance score for better result ordering
  const calculateRelevanceScore = (searchTerm: string, targetText: string): number => {
    if (!searchTerm || !targetText) return 0;
    
    const searchLower = searchTerm.toLowerCase().trim();
    const targetLower = targetText.toLowerCase();
    
    // Exact match gets highest score
    if (targetLower === searchLower) return 100;
    
    // Direct substring match gets high score
    if (targetLower.includes(searchLower)) {
      // Score based on how much of the target the search term covers
      return 80 + (searchLower.length / targetLower.length) * 15;
    }
    
    // Word boundary matches get medium score
    const searchWords = searchLower.split(/\s+/);
    const targetWords = targetLower.split(/\s+/);
    
    const wordMatches = searchWords.filter(searchWord => 
      targetWords.some(targetWord => 
        targetWord.includes(searchWord) || searchWord.includes(targetWord)
      )
    ).length;
    
    if (wordMatches > 0) {
      return 50 + (wordMatches / searchWords.length) * 25;
    }
    
    return 0;
  };

  // Enhanced search function that searches across multiple fields
  const searchQuotations = (quotations: QuotationData[], searchTerm: string): QuotationData[] => {
    if (!searchTerm.trim()) return quotations;
    
    const resultsWithScores = quotations.map((quotation) => {
      // Extract brand names from car models for better search
      const getBrandFromModel = (carModel: string): string[] => {
        const brands = [];
        const modelLower = carModel.toLowerCase();
        
        // Common car brands that might be in model names
        if (modelLower.includes('wagon') || modelLower.includes('swift') || modelLower.includes('dzire') || 
            modelLower.includes('ertiga') || modelLower.includes('baleno') || modelLower.includes('vitara')) {
          brands.push('Maruti', 'Maruti Suzuki', 'Suzuki');
        }
        if (modelLower.includes('creta') || modelLower.includes('verna') || modelLower.includes('i20') || 
            modelLower.includes('venue') || modelLower.includes('tucson')) {
          brands.push('Hyundai');
        }
        if (modelLower.includes('innova') || modelLower.includes('fortuner') || modelLower.includes('camry') || 
            modelLower.includes('corolla') || modelLower.includes('glanza')) {
          brands.push('Toyota');
        }
        if (modelLower.includes('nexon') || modelLower.includes('harrier') || modelLower.includes('safari') || 
            modelLower.includes('altroz') || modelLower.includes('tigor')) {
          brands.push('Tata');
        }
        if (modelLower.includes('seltos') || modelLower.includes('sonet') || modelLower.includes('carens')) {
          brands.push('Kia');
        }
        
        return brands;
      };

      const searchableFields = [
        // Basic quotation info
        quotation.vendor_id,
        quotation.car_model,
        quotation.model_variant,
        
        // Brand names extracted from car model
        ...getBrandFromModel(quotation.car_model),
        
        // Bank names and variations
        quotation.sbi_bank > 0 ? 'SBI Bank' : '',
        quotation.sbi_bank > 0 ? 'SBI' : '',
        quotation.sbi_bank > 0 ? 'State Bank' : '',
        quotation.union_bank > 0 ? 'Union Bank' : '',
        quotation.union_bank > 0 ? 'Union' : '',
        quotation.mahindra_finance > 0 ? 'Mahindra Finance' : '',
        quotation.mahindra_finance > 0 ? 'Mahindra' : '',
        quotation.cholamandalam_bank > 0 ? 'Cholamandalam Bank' : '',
        quotation.cholamandalam_bank > 0 ? 'Cholamandalam' : '',
        quotation.cholamandalam_bank > 0 ? 'Chola' : '',
        quotation.au_bank > 0 ? 'AU Bank' : '',
        quotation.au_bank > 0 ? 'AU' : '',

        // Price fields for search
        quotation.ex_showroom.toString(),
        quotation.on_the_road.toString(),
        quotation.monthly_emi.toString(),
        quotation.down_payment.toString(),
        quotation.final_down_payment.toString(),
        quotation.loan_amount.toString(),

        // Interest rates for search
        quotation.roi_emi_interest.toString(),
        quotation.sbi_bank.toString(),
        quotation.union_bank.toString(),
        quotation.mahindra_finance.toString(),
        quotation.cholamandalam_bank.toString(),
        quotation.au_bank.toString(),
        
        // EMI period
        quotation.emi_years > 0 ? `${quotation.emi_years} years` : '',
        quotation.emi_years > 0 ? `${quotation.emi_years}yr` : '',
        
        // Date for search (raw format)
        quotation.created_at,
        
        // Additional searchable terms
        quotation.accessories > 0 ? 'accessories' : '',
        quotation.insurance > 0 ? 'insurance' : '',
        quotation.registration > 0 ? 'registration' : '',
        quotation.offers > 0 ? 'offers' : '',
        quotation.offers > 0 ? 'discount' : ''
              ];
        
        // Calculate maximum relevance score across all fields
        let maxScore = 0;
        let hasMatch = false;
        
        for (const field of searchableFields) {
          if (field) {
            const fieldStr = field.toString();
            if (fuzzyMatch(searchTerm, fieldStr)) {
              hasMatch = true;
              const score = calculateRelevanceScore(searchTerm, fieldStr);
              maxScore = Math.max(maxScore, score);
            }
          }
        }
        
        return {
          quotation,
          relevanceScore: maxScore,
          hasMatch
        };
      });

      // Filter results with minimum relevance threshold and sort by relevance
      return resultsWithScores
        .filter(result => result.hasMatch && result.relevanceScore >= 40) // Minimum 40% relevance
        .sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance (highest first)
        .map(result => result.quotation);
    };

  const filteredQuotations = searchQuotations(quotations, searchTerm);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSelectedBank = (quotation: QuotationData) => {
    if (quotation.sbi_bank > 0) return { name: 'SBI Bank', rate: quotation.sbi_bank };
    if (quotation.union_bank > 0) return { name: 'Union Bank', rate: quotation.union_bank };
    if (quotation.mahindra_finance > 0) return { name: 'Mahindra Finance', rate: quotation.mahindra_finance };
    if (quotation.cholamandalam_bank > 0) return { name: 'Cholamandalam Bank', rate: quotation.cholamandalam_bank };
    if (quotation.au_bank > 0) return { name: 'AU Bank', rate: quotation.au_bank };
    return { name: 'None', rate: 0 };
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Manage Quotations</h1>
        <p>View and manage all vehicle quotations</p>
        
        {successMessage && (
          <div className="success-banner">
            <div className="success-icon">✓</div>
            <div className="success-text">
              <strong>Success!</strong> {successMessage}
            </div>
            <button 
              className="success-close-btn"
              onClick={() => setSuccessMessage(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="quotation-list-controls">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search by Brand, Model, Variant, Bank, Price, EMI, Year... (supports fuzzy matching)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            title="Smart search supports fuzzy matching - try 'wagnor' for 'WagonR', 'ertiga' for 'Ertiga', etc."
          />
          {searchTerm && (
            <div className="search-hints">
              💡 Fuzzy search active - searching across all fields including car models, variants, banks, and prices
            </div>
          )}
        </div>
        
        <div className="action-section">
          <button 
            className="create-quotation-btn"
            onClick={() => navigate('/dashboard/quotation')}
          >
            <span className="btn-icon">+</span>
            Create New Quotation
          </button>
          <button 
            className="refresh-btn"
            onClick={fetchQuotations}
            disabled={loading}
          >
            <span className="btn-icon">🔄</span>
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading quotations...</p>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <div className="error-text">
            <strong>Error:</strong> {error}
          </div>
          <button 
            className="error-close-btn"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="quotation-list-container">
          <div className="quotation-list-header">
            <h3>All Quotations ({filteredQuotations.length})</h3>
          </div>

          {filteredQuotations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h3>No Quotations Found</h3>
              <p>
                {searchTerm 
                  ? `No quotations match your search "${searchTerm}"`
                  : 'No quotations have been created yet.'
                }
              </p>
              <button 
                className="create-first-quotation-btn"
                onClick={() => navigate('/dashboard/quotation')}
              >
                Create Your First Quotation
              </button>
            </div>
          ) : (
            <div className="quotation-grid">
              {filteredQuotations.map((quotation) => {
                const selectedBank = getSelectedBank(quotation);
                
                return (
                  <div key={quotation.vendor_id} className="quotation-card">
                    <div className="quotation-card-header">
                      <div className="quotation-id">#{quotation.vendor_id}</div>
                      <div className="quotation-date">
                        {formatDate(quotation.created_at)}
                      </div>
                    </div>
                    
                    <div className="quotation-card-body">
                      <div className="vehicle-info">
                        <h4>{quotation.car_model}</h4>
                        <span className="variant">{quotation.model_variant}</span>
                      </div>
                      
                      <div className="price-info">
                        <div className="price-row">
                          <span>On Road Price:</span>
                          <strong>{formatCurrency(quotation.on_the_road)}</strong>
                        </div>
                        <div className="price-row">
                          <span>Down Payment:</span>
                          <strong>{formatCurrency(quotation.final_down_payment)}</strong>
                        </div>
                        {quotation.monthly_emi > 0 && (
                          <div className="price-row">
                            <span>Monthly EMI:</span>
                            <strong>
                              {formatCurrency(quotation.monthly_emi)}
                              {quotation.emi_years > 0 && (
                                <small> for {quotation.emi_years}yr</small>
                              )}
                            </strong>
                          </div>
                        )}
                      </div>
                      
                      {selectedBank.name !== 'None' && (
                        <div className="bank-info">
                          <span className="bank-tag">
                            {selectedBank.name} - {selectedBank.rate}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="quotation-card-actions">
                      <button
                        className="view-btn"
                        onClick={() => handleViewQuotation(quotation)}
                      >
                        👁️ View
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditQuotation(quotation)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="download-btn"
                        onClick={() => handleDownloadQuotation(quotation)}
                      >
                        📥 Download
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteQuotation(quotation)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quotation Detail Modal (View Only) */}
      {isDetailModalOpen && selectedQuotation && (
        <div className="quotation-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDetailModal()}>
          <div className="quotation-modal quotation-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quotation-modal-header">
              <h2>Quotation Details - {selectedQuotation.vendor_id}</h2>
              <button className="close-modal-btn" onClick={closeDetailModal}>×</button>
            </div>
            
            <div className="quotation-modal-body">
              <div className="detail-sections">
                <div className="detail-section">
                  <h4>Vehicle Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Model:</span>
                      <strong>{selectedQuotation.car_model} {selectedQuotation.model_variant}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Created:</span>
                      <strong>{formatDate(selectedQuotation.created_at)}</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Cost Breakdown</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Ex-Showroom:</span>
                      <strong>{formatCurrency(selectedQuotation.ex_showroom)}</strong>
                    </div>
                    {/* Only show TCS if Ex-Showroom > ₹10,00,000 */}
                    {selectedQuotation.ex_showroom > 1000000 && (
                      <div className="detail-item">
                        <span>TCS:</span>
                        <strong>{formatCurrency(selectedQuotation.tcs)}</strong>
                      </div>
                    )}
                    <div className="detail-item">
                      <span>Registration:</span>
                      <strong>{formatCurrency(selectedQuotation.registration)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Insurance:</span>
                      <strong>{formatCurrency(selectedQuotation.insurance)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Accessories:</span>
                      <strong>{formatCurrency(selectedQuotation.accessories)}</strong>
                    </div>
                    <div className="detail-item highlight">
                      <span>On Road Price:</span>
                      <strong>{formatCurrency((() => {
                        // Calculate corrected On-Road Price excluding Number Plate/CRTm/AutoCard charges
                        const tcsAmount = selectedQuotation.ex_showroom > 1000000 ? selectedQuotation.tcs : 0;
                        const correctedOnRoadPrice = 
                          selectedQuotation.ex_showroom + 
                          tcsAmount + 
                          selectedQuotation.registration + 
                          selectedQuotation.insurance + 
                          selectedQuotation.gps + 
                          selectedQuotation.fastag + 
                          selectedQuotation.speed_governor + 
                          selectedQuotation.accessories;
                          // Note: number_plate_crtm_autocard is excluded from On-Road Price
                        return correctedOnRoadPrice;
                      })())}</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Financing Details</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span>Selected Bank:</span>
                      <strong>{getSelectedBank(selectedQuotation).name}</strong>
                    </div>
                    {getSelectedBank(selectedQuotation).rate > 0 && (
                      <div className="detail-item">
                        <span>Interest Rate:</span>
                        <strong>{getSelectedBank(selectedQuotation).rate}%</strong>
                      </div>
                    )}
                    <div className="detail-item">
                      <span>Loan Amount:</span>
                      <strong>{formatCurrency(selectedQuotation.loan_amount)}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Down Payment:</span>
                      <strong>{formatCurrency(selectedQuotation.down_payment)}</strong>
                    </div>
                    {selectedQuotation.offers > 0 && (
                      <div className="detail-item">
                        <span>Offers/Discounts:</span>
                        <strong>-{formatCurrency(selectedQuotation.offers)}</strong>
                      </div>
                    )}
                    <div className="detail-item highlight">
                      <span>Final Down Payment:</span>
                      <strong>{formatCurrency(selectedQuotation.final_down_payment)}</strong>
                    </div>
                    {selectedQuotation.monthly_emi > 0 && (
                      <div className="detail-item highlight">
                        <span>Monthly EMI:</span>
                        <strong>
                          {formatCurrency(selectedQuotation.monthly_emi)}
                          {selectedQuotation.emi_years > 0 && (
                            <small> for {selectedQuotation.emi_years} years</small>
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="quotation-modal-footer">
              <button className="cancel-btn" onClick={closeDetailModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Quotation Modal */}
      {isEditModalOpen && selectedQuotation && editFormData && (
        <div className="quotation-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeEditModal()}>
          <div className="quotation-modal quotation-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quotation-modal-header">
              <h2>Edit Quotation - {selectedQuotation.vendor_id}</h2>
              <button className="close-modal-btn" onClick={closeEditModal}>×</button>
            </div>
            
            <div className="quotation-modal-body">
              <form className="edit-quotation-form">
                <div className="form-sections">
                  {/* Vehicle Information Section */}
                  <div className="form-section">
                    <h4>Vehicle Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Car Model</label>
                        <select
                          value={editFormData.car_model || ''}
                          onChange={(e) => handleEditFormChange('car_model', e.target.value)}
                        >
                          <option value="">Select Car Model</option>
                          {Object.keys(carVariants).map(model => (
                            <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Model Variant</label>
                        <select
                          value={editFormData.model_variant || ''}
                          onChange={(e) => handleEditFormChange('model_variant', e.target.value)}
                          disabled={!editFormData.car_model}
                        >
                          <option value="">Select Variant</option>
                          {editFormData.car_model && carVariants[editFormData.car_model as keyof typeof carVariants]?.map(variant => (
                            <option key={variant} value={variant}>{variant}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Bank Information Section */}
                  <div className="form-section">
                    <h4>Bank Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>ROI/EMI Interest (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.roi_emi_interest || ''}
                          onChange={(e) => handleEditFormChange('roi_emi_interest', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>SBI Bank (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.sbi_bank || ''}
                          onChange={(e) => handleEditFormChange('sbi_bank', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Union Bank (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.union_bank || ''}
                          onChange={(e) => handleEditFormChange('union_bank', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Mahindra Finance (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.mahindra_finance || ''}
                          onChange={(e) => handleEditFormChange('mahindra_finance', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cholamandalam Bank (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.cholamandalam_bank || ''}
                          onChange={(e) => handleEditFormChange('cholamandalam_bank', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>AU Bank (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editFormData.au_bank || ''}
                          onChange={(e) => handleEditFormChange('au_bank', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cost Information Section */}
                  <div className="form-section">
                    <h4>Cost Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Ex-Showroom Price (₹)</label>
                        <input
                          type="number"
                          value={editFormData.ex_showroom || ''}
                          onChange={(e) => handleEditFormChange('ex_showroom', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>TCS (₹)</label>
                        <input
                          type="number"
                          value={editFormData.tcs || ''}
                          onChange={(e) => handleEditFormChange('tcs', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Registration (₹)</label>
                        <input
                          type="number"
                          value={editFormData.registration || ''}
                          onChange={(e) => handleEditFormChange('registration', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Insurance (₹)</label>
                        <input
                          type="number"
                          value={editFormData.insurance || ''}
                          onChange={(e) => handleEditFormChange('insurance', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Number Plate/CRTm/AutoCard (₹)</label>
                        <input
                          type="number"
                          value={editFormData.number_plate_crtm_autocard || ''}
                          onChange={(e) => handleEditFormChange('number_plate_crtm_autocard', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>GPS (₹)</label>
                        <input
                          type="number"
                          value={editFormData.gps || ''}
                          onChange={(e) => handleEditFormChange('gps', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>FASTag (₹)</label>
                        <input
                          type="number"
                          value={editFormData.fastag || ''}
                          onChange={(e) => handleEditFormChange('fastag', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Speed Governor (₹)</label>
                        <input
                          type="number"
                          value={editFormData.speed_governor || ''}
                          onChange={(e) => handleEditFormChange('speed_governor', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Accessories (₹)</label>
                        <input
                          type="number"
                          value={editFormData.accessories || ''}
                          onChange={(e) => handleEditFormChange('accessories', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loan Information Section */}
                  <div className="form-section">
                    <h4>Loan Information</h4>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>On the Road Price (₹)</label>
                        <input
                          type="number"
                          value={editFormData.on_the_road || ''}
                          onChange={(e) => handleEditFormChange('on_the_road', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Loan Amount (₹)</label>
                        <input
                          type="number"
                          value={editFormData.loan_amount || ''}
                          onChange={(e) => handleEditFormChange('loan_amount', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Margin Down Payment (₹)</label>
                        <input
                          type="number"
                          value={editFormData.margin_down_payment || ''}
                          onChange={(e) => handleEditFormChange('margin_down_payment', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Process Fee (₹)</label>
                        <input
                          type="number"
                          value={editFormData.process_fee || ''}
                          onChange={(e) => handleEditFormChange('process_fee', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Stamp Duty (₹)</label>
                        <input
                          type="number"
                          value={editFormData.stamp_duty || ''}
                          onChange={(e) => handleEditFormChange('stamp_duty', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Handling Document Charge (₹)</label>
                        <input
                          type="number"
                          value={editFormData.handling_document_charge || ''}
                          onChange={(e) => handleEditFormChange('handling_document_charge', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Loan Suraksha Insurance (₹)</label>
                        <input
                          type="number"
                          value={editFormData.loan_suraksha_insurance || ''}
                          onChange={(e) => handleEditFormChange('loan_suraksha_insurance', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Down Payment (₹)</label>
                        <input
                          type="number"
                          value={editFormData.down_payment || ''}
                          onChange={(e) => handleEditFormChange('down_payment', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Offers (₹)</label>
                        <input
                          type="number"
                          value={editFormData.offers || ''}
                          onChange={(e) => handleEditFormChange('offers', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Final Down Payment (₹)</label>
                        <input
                          type="number"
                          value={editFormData.final_down_payment || ''}
                          onChange={(e) => handleEditFormChange('final_down_payment', parseFloat(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>EMI Years</label>
                        <input
                          type="number"
                          value={editFormData.emi_years || ''}
                          onChange={(e) => handleEditFormChange('emi_years', parseInt(e.target.value))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Monthly EMI (₹)</label>
                        <input
                          type="number"
                          value={editFormData.monthly_emi || ''}
                          onChange={(e) => handleEditFormChange('monthly_emi', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="quotation-modal-footer">
              <button className="cancel-btn" onClick={closeEditModal} disabled={updateLoading}>
                Cancel
              </button>
              <button 
                className="save-btn" 
                onClick={handleUpdateQuotation}
                disabled={updateLoading}
              >
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedQuotation && (
        <div className="quotation-modal-overlay" onClick={(e) => e.target === e.currentTarget && closeDeleteModal()}>
          <div className="quotation-modal quotation-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quotation-modal-header">
              <h2>Delete Quotation</h2>
              <button className="close-modal-btn" onClick={closeDeleteModal}>×</button>
            </div>
            
            <div className="quotation-modal-body">
              <div className="delete-confirmation">
                <div className="warning-icon">⚠️</div>
                <h3>Are you sure you want to delete this quotation?</h3>
                <p>
                  <strong>Quotation ID:</strong> {selectedQuotation.vendor_id}<br/>
                  <strong>Car:</strong> {selectedQuotation.car_model} {selectedQuotation.model_variant}<br/>
                  <strong>Created:</strong> {formatDate(selectedQuotation.created_at)}
                </p>
                <p className="warning-text">
                  This action cannot be undone. The quotation will be permanently removed from the database.
                </p>
              </div>
            </div>
            
            <div className="quotation-modal-footer">
              <button className="cancel-btn" onClick={closeDeleteModal} disabled={deleteLoading}>
                Cancel
              </button>
              <button 
                className="delete-confirm-btn" 
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Quotation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationList; 