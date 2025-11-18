import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import apiService from '../../services/apiService';

interface ShowroomContact {
  id?: number;
  contact_person_name: string;
  designation: string;
  phone_number: string;
  email_address: string;
}

interface Showroom {
  id?: number;
  showroom_name: string;
  showroom_address: string;
  state: string;
  address_city: string;
  showroom_city: string;
  brand: string;
  contacts?: ShowroomContact[];
}

interface ShowroomFormData {
  showroom_name: string;
  showroom_address: string;
  state: string;
  address_city: string;
  showroom_city: string;
  brand: string;
}

interface ContactFormData {
  contact_person_name: string;
  designation: string;
  phone_number: string;
  email_address: string;
}

const ShowroomManagement: React.FC = () => {
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [selectedShowroom, setSelectedShowroom] = useState<Showroom | null>(null);
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<ShowroomContact | null>(null);

  const [showroomForm, setShowroomForm] = useState<ShowroomFormData>({
    showroom_name: '',
    showroom_address: '',
    state: '',
    address_city: '',
    showroom_city: '',
    brand: ''
  });

  const [contactForm, setContactForm] = useState<ContactFormData>({
    contact_person_name: '',
    designation: '',
    phone_number: '',
    email_address: ''
  });

  const brands = ['Maruti Suzuki', 'Hyundai', 'Toyota', 'Honda', 'Tata', 'Mahindra'];
  
  const stateOptions = ['Maharashtra'];
  
  const cityOptions: Record<string, string[]> = {
    'Maharashtra': [
      'Mumbai',
      'Navi Mumbai', 
      'Thane',
      'Kalyan',
      'Dombivli',
      'Vasai-Virar',
      'Mira-Bhayandar',
      'Bhiwandi',
      'Ulhasnagar',
      'Ambernath',
      'Badlapur',
      'Panvel',
      'Kharghar',
      'Vashi',
      'Airoli',
      'Borivali',
      'Andheri',
      'Bandra',
      'Powai',
      'Mulund'
    ]
  };

  useEffect(() => {
    fetchShowrooms();
  }, []);

  const fetchShowrooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/showrooms/with-contacts');
      if (response.success) {
        setShowrooms(response.data);
      } else {
        setError('Failed to fetch showrooms');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch showrooms');
      console.error('Error fetching showrooms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowroomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingShowroom) {
        await apiService.put(`/showrooms/${editingShowroom.id}`, showroomForm);
      } else {
        await apiService.post('/showrooms', showroomForm);
      }
      
      fetchShowrooms();
      resetShowroomForm();
      setShowAddForm(false);
      setEditingShowroom(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save showroom');
      console.error('Error saving showroom:', err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContact) {
        await apiService.put(`/showrooms/contacts/${editingContact.id}`, contactForm);
      } else if (selectedShowroom) {
        await apiService.post(`/showrooms/${selectedShowroom.id}/contacts`, contactForm);
      }
      
      fetchShowrooms();
      resetContactForm();
      setShowContactForm(false);
      setEditingContact(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
      console.error('Error saving contact:', err);
    }
  };

  const handleDeleteShowroom = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this showroom? This will also delete all associated contacts.')) {
      try {
        await apiService.delete(`/showrooms/${id}`);
        fetchShowrooms();
      } catch (err: any) {
        setError(err.message || 'Failed to delete showroom');
        console.error('Error deleting showroom:', err);
      }
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await apiService.delete(`/showrooms/contacts/${contactId}`);
        fetchShowrooms();
      } catch (err: any) {
        setError(err.message || 'Failed to delete contact');
        console.error('Error deleting contact:', err);
      }
    }
  };

  const resetShowroomForm = () => {
    setShowroomForm({
      showroom_name: '',
      showroom_address: '',
      state: 'Maharashtra', // Default to Maharashtra
      address_city: '',
      showroom_city: '',
      brand: ''
    });
  };

  const resetContactForm = () => {
    setContactForm({
      contact_person_name: '',
      designation: '',
      phone_number: '',
      email_address: ''
    });
  };

  const startEditShowroom = (showroom: Showroom) => {
    setEditingShowroom(showroom);
    setShowroomForm({
      showroom_name: showroom.showroom_name,
      showroom_address: showroom.showroom_address,
      state: showroom.state || 'Maharashtra', // Default to Maharashtra if no state
      address_city: showroom.address_city,
      showroom_city: showroom.showroom_city,
      brand: showroom.brand
    });
    setShowAddForm(true);
  };

  const startAddContact = (showroom: Showroom) => {
    setSelectedShowroom(showroom);
    setShowContactForm(true);
    resetContactForm();
    setEditingContact(null);
  };

  const startEditContact = (contact: ShowroomContact) => {
    setEditingContact(contact);
    setContactForm({
      contact_person_name: contact.contact_person_name,
      designation: contact.designation,
      phone_number: contact.phone_number,
      email_address: contact.email_address
    });
    setShowContactForm(true);
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Loading showrooms...</p>
    </div>
  );

  return (
    <div className="showroom-management">
      <div className="page-header">
        <h1>Showroom Management</h1>
        <button 
          className="add-button"
          onClick={() => {
            setShowAddForm(true);
            setEditingShowroom(null);
            resetShowroomForm();
          }}
        >
          + Add Showroom
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {(showAddForm || editingShowroom) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}</h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingShowroom(null);
                  resetShowroomForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleShowroomSubmit} className="showroom-form">
              <div className="form-group">
                <label>Showroom Name *</label>
                <input
                  type="text"
                  value={showroomForm.showroom_name}
                  onChange={(e) => setShowroomForm({...showroomForm, showroom_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Showroom Address *</label>
                <textarea
                  value={showroomForm.showroom_address}
                  onChange={(e) => setShowroomForm({...showroomForm, showroom_address: e.target.value})}
                  required
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <select
                    value={showroomForm.state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setShowroomForm({
                        ...showroomForm, 
                        state: newState,
                        address_city: '', // Reset city when state changes
                        showroom_city: '' // Reset showroom city as well
                      });
                    }}
                    required
                  >
                    <option value="">Select State</option>
                    {stateOptions.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Address City *</label>
                  <select
                    value={showroomForm.address_city}
                    onChange={(e) => setShowroomForm({...showroomForm, address_city: e.target.value})}
                    required
                    disabled={!showroomForm.state}
                  >
                    <option value="">Select City</option>
                    {showroomForm.state && cityOptions[showroomForm.state]?.map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Showroom City</label>
                  <select
                    value={showroomForm.showroom_city}
                    onChange={(e) => setShowroomForm({...showroomForm, showroom_city: e.target.value})}
                    disabled={!showroomForm.state}
                  >
                    <option value="">Select Showroom City (Optional)</option>
                    {showroomForm.state && cityOptions[showroomForm.state]?.map((city: string) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Brand *</label>
                  <select
                    value={showroomForm.brand}
                    onChange={(e) => setShowroomForm({...showroomForm, brand: e.target.value})}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingShowroom ? 'Update Showroom' : 'Create Showroom'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingShowroom(null);
                    resetShowroomForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showContactForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingContact ? 'Edit Contact' : 'Add New Contact'}</h2>
              <button 
                className="close-button"
                onClick={() => {
                  setShowContactForm(false);
                  setEditingContact(null);
                  resetContactForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label>Contact Person Name *</label>
                <input
                  type="text"
                  value={contactForm.contact_person_name}
                  onChange={(e) => setContactForm({...contactForm, contact_person_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  value={contactForm.designation}
                  onChange={(e) => setContactForm({...contactForm, designation: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={contactForm.phone_number}
                    onChange={(e) => setContactForm({...contactForm, phone_number: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={contactForm.email_address}
                    onChange={(e) => setContactForm({...contactForm, email_address: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => {
                    setShowContactForm(false);
                    setEditingContact(null);
                    resetContactForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="showrooms-list">
        {showrooms.map((showroom, index) => (
          <div 
            key={showroom.id} 
            className="showroom-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="showroom-header">
              <div className="showroom-info">
                <h3>{showroom.showroom_name}</h3>
                <p className="brand-badge" data-brand={showroom.brand}>{showroom.brand}</p>
              </div>
              <div className="showroom-actions">
                <button 
                  className="edit-button"
                  onClick={() => startEditShowroom(showroom)}
                  title="Edit Showroom"
                >
                  ✏️
                </button>
                <button 
                  className="delete-button"
                  onClick={() => showroom.id && handleDeleteShowroom(showroom.id)}
                  title="Delete Showroom"
                >
                  🗑️
                </button>
              </div>
            </div>
            
            <div className="showroom-details">
              <p><strong>📍 Address:</strong> {showroom.showroom_address}</p>
              <p><strong>🌏 State:</strong> {showroom.state}</p>
              <p><strong>🏙️ City:</strong> {showroom.address_city}</p>
              {showroom.showroom_city && showroom.showroom_city !== showroom.address_city && (
                <p><strong>🎯 Showroom City:</strong> {showroom.showroom_city}</p>
              )}
            </div>

            <div className="contacts-section">
              <div className="contacts-header">
                <h4>Contact Persons ({showroom.contacts?.length || 0})</h4>
                <button 
                  className="add-contact-button"
                  onClick={() => startAddContact(showroom)}
                >
                  + Add Contact
                </button>
              </div>
              
              {showroom.contacts && showroom.contacts.length > 0 ? (
                <div className="contacts-list">
                  {showroom.contacts.map((contact) => (
                    <div key={contact.id} className="contact-item">
                      <div className="contact-info">
                        <p><strong>{contact.contact_person_name}</strong></p>
                        {contact.designation && <p className="designation">💼 {contact.designation}</p>}
                        {contact.phone_number && <p>📞 {contact.phone_number}</p>}
                        {contact.email_address && <p>📧 {contact.email_address}</p>}
                      </div>
                      <div className="contact-actions">
                        <button 
                          className="edit-contact-button"
                          onClick={() => startEditContact(contact)}
                          title="Edit Contact"
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-contact-button"
                          onClick={() => contact.id && handleDeleteContact(contact.id)}
                          title="Delete Contact"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-contacts">No contacts added yet</p>
              )}
            </div>
          </div>
        ))}
        
        {showrooms.length === 0 && !loading && (
          <div className="no-data">
            <p>No showrooms found. Click "Add Showroom" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowroomManagement;