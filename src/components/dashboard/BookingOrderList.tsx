import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './TableBorders.css';
import bookingOrderService from '../../services/bookingOrderService';
import { generateBookingOrderPDF } from '../../utils/bookingOrderPdfGenerator';

interface BookingOrder {
    id: number;
    order_number: string;
    order_date: string;
    company_name: string;
    tours_travels_name: string;
    car_model: string;
    variant?: string;
    color: string;
    rto_passing: string;
    customer_name: string;
    customer_contact: string;
    customer_address: string;
    created_at: string;
}

const BookingOrderList: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<BookingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<BookingOrder[]>([]);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<BookingOrder | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<BookingOrder>>({});

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order =>
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.car_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.tours_travels_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_contact.includes(searchTerm)
            );
            setFilteredOrders(filtered);
        }
    }, [searchTerm, orders]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await bookingOrderService.getAllBookingOrders();
            setOrders(data);
            setFilteredOrders(data);
        } catch (error) {
            console.error('Error fetching booking orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (order: BookingOrder) => {
        setSelectedOrder(order);
        setEditFormData({ ...order }); // Clone data
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!selectedOrder) return;
        try {
            await bookingOrderService.updateBookingOrder(selectedOrder.id, editFormData);
            setIsEditModalOpen(false);
            fetchOrders();
            alert('Booking Order Updated Successfully');
        } catch (error) {
            console.error('Error updating booking order:', error);
            alert('Failed to update booking order');
        }
    };

    const handleDownloadPDF = async (order: BookingOrder) => {
        try {
            await generateBookingOrderPDF({
                orderNumber: order.order_number,
                orderDate: order.order_date,
                companyName: order.company_name,
                toursAndTravelsName: order.tours_travels_name,
                carModel: order.car_model,
                variant: order.variant,
                color: order.color,
                rtoPassing: order.rto_passing,
                customerName: order.customer_name,
                customerContact: order.customer_contact,
                customerAddress: order.customer_address
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this booking order?')) {
            try {
                await bookingOrderService.deleteBookingOrder(id);
                fetchOrders(); // Refresh the list
            } catch (error) {
                console.error('Error deleting booking order:', error);
                alert('Failed to delete booking order. Please try again.');
            }
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="loading-spinner">Loading booking orders...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container" style={{ maxWidth: '100%' }}>
            <div className="dashboard-welcome">
                <h1>Booking Orders</h1>
                <p>View, search, and manage all booking orders</p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate('/dashboard/booking-order/new')}
                    style={{ marginTop: '1rem' }}
                >
                    + Create New Booking Order
                </button>
            </div>

            {/* Search Bar */}
            <div className="quotation-filters">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by customer name, company, order number, car model, or contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Results Summary */}
            <div className="results-summary">
                <p>
                    Showing {filteredOrders.length} of {orders.length} booking orders
                </p>
            </div>

            {/* Booking Orders Table - Desktop View */}
            <div className="quotations-table-container desktop-table-view">
                {filteredOrders.length === 0 ? (
                    <div className="no-data-message">
                        <p>No booking orders found. {searchTerm ? 'Try adjusting your search.' : 'Create your first booking order!'}</p>
                    </div>
                ) : (
                    <table className="quotations-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Date</th>
                                <th>Customer Name</th>
                                <th>Contact</th>
                                <th>Company</th>
                                <th>Tours & Travels</th>
                                <th>Car Model</th>
                                <th>Color</th>
                                <th>RTO</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="receipt-number">{order.order_number}</td>
                                    <td>{formatDate(order.order_date)}</td>
                                    <td className="highlighted-name">{order.customer_name}</td>
                                    <td>{order.customer_contact}</td>
                                    <td className="highlighted-company">{order.company_name}</td>
                                    <td>{order.tours_travels_name}</td>
                                    <td>
                                        {order.car_model}
                                        {order.variant && <div className="variant-text">{order.variant}</div>}
                                    </td>
                                    <td>
                                        <span className="color-badge">{order.color}</span>
                                    </td>
                                    <td>{order.rto_passing}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleDownloadPDF(order)}
                                            className="btn-action btn-download"
                                            title="Download PDF"
                                        >
                                            Download
                                        </button>
                                        <button
                                            onClick={() => handleEditClick(order)}
                                            className="btn-action btn-view"
                                            title="Edit"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(order.id)}
                                            className="btn-action btn-delete"
                                            title="Delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Booking Orders Cards - Mobile View */}
            <div className="receipts-cards-container mobile-card-view">
                {filteredOrders.length === 0 ? (
                    <div className="no-data-message">
                        <p>No booking orders found. {searchTerm ? 'Try adjusting your search.' : 'Create your first booking order!'}</p>
                    </div>
                ) : (
                    <div className="receipts-cards-grid">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="receipt-card">
                                <div className="receipt-card-header">
                                    <div className="receipt-card-number">
                                        <span className="label">Order #</span>
                                        <span className="receipt-number">{order.order_number}</span>
                                    </div>
                                    <div className="receipt-card-date">
                                        {formatDate(order.order_date)}
                                    </div>
                                </div>

                                <div className="receipt-card-body">
                                    <div className="receipt-card-row">
                                        <span className="label">Customer:</span>
                                        <span className="value">{order.customer_name}</span>
                                    </div>
                                    <div className="receipt-card-row">
                                        <span className="label">Contact:</span>
                                        <span className="value">{order.customer_contact}</span>
                                    </div>
                                    <div className="receipt-card-row">
                                        <span className="label">Company:</span>
                                        <span className="value">{order.company_name}</span>
                                    </div>
                                    <div className="receipt-card-row">
                                        <span className="label">Travels:</span>
                                        <span className="value">{order.tours_travels_name}</span>
                                    </div>
                                    <div className="receipt-card-row">
                                        <span className="label">Car Model:</span>
                                        <span className="value">{order.car_model}</span>
                                    </div>
                                    {order.variant && (
                                        <div className="receipt-card-row">
                                            <span className="label">Variant:</span>
                                            <span className="value">{order.variant}</span>
                                        </div>
                                    )}
                                    <div className="receipt-card-row">
                                        <span className="label">Color:</span>
                                        <span className="color-badge">{order.color}</span>
                                    </div>
                                    <div className="receipt-card-row">
                                        <span className="label">RTO:</span>
                                        <span className="value">{order.rto_passing}</span>
                                    </div>
                                </div>

                                <div className="receipt-card-actions">
                                    <button
                                        onClick={() => handleDownloadPDF(order)}
                                        className="btn-card-action btn-download"
                                    >
                                        📥 Download
                                    </button>
                                    <button
                                        onClick={() => handleEditClick(order)}
                                        className="btn-card-action btn-view"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(order.id)}
                                        className="btn-card-action btn-delete"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Booking Order</h2>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label>Customer Name</label>
                                    <input name="customer_name" value={editFormData.customer_name || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Contact Number</label>
                                    <input name="customer_contact" value={editFormData.customer_contact || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group full-width">
                                    <label>Address</label>
                                    <textarea name="customer_address" value={editFormData.customer_address || ''} onChange={handleEditChange} className="form-control" rows={2} />
                                </div>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <select name="company_name" value={editFormData.company_name || ''} onChange={handleEditChange} className="form-control">
                                        <option value="VELOX MOTORS PVT. LTD">VELOX MOTORS PVT. LTD</option>
                                        <option value="GAUTAM MOTORS">GAUTAM MOTORS</option>
                                        <option value="Modi Hyundai Malad">Modi Hyundai Malad</option>
                                        <option value="Excell Autovista Private Limited">Excell Autovista Private Limited</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Tours & Travels</label>
                                    <input name="tours_travels_name" value={editFormData.tours_travels_name || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Car Model</label>
                                    <input name="car_model" value={editFormData.car_model || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Variant</label>
                                    <input name="variant" value={editFormData.variant || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Color</label>
                                    <input name="color" value={editFormData.color || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>RTO Passing</label>
                                    <input name="rto_passing" value={editFormData.rto_passing || ''} onChange={handleEditChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Order Date</label>
                                    <input type="date" name="order_date" value={editFormData.order_date ? new Date(String(editFormData.order_date)).toISOString().split('T')[0] : ''} onChange={handleEditChange} className="form-control" />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
                            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingOrderList;
