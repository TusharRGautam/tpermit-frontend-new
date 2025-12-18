import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
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
    customer_address: string;
    created_at: string;
}

const BookingOrderList: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<BookingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<BookingOrder[]>([]);

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
                order.car_model.toLowerCase().includes(searchTerm.toLowerCase())
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

    return (
        <div className="dashboard-container">
            <div className="dashboard-welcome">
                <div className="welcome-header">
                    <div>
                        <h1>Booking Orders</h1>
                        <p>View and manage all booking orders</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/dashboard/booking-order/new')}
                    >
                        + New Booking Order
                    </button>
                </div>
            </div>

            <div className="quotation-list-container">
                {/* Search Bar */}
                <div className="search-section">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by customer name, company, order number, or car model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                {/* Orders Table */}
                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading booking orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📄</div>
                        <h3>No booking orders found</h3>
                        <p>
                            {searchTerm
                                ? 'Try adjusting your search criteria'
                                : 'Create your first booking order to get started'}
                        </p>
                        {!searchTerm && (
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/dashboard/booking-order/new')}
                            >
                                Create Booking Order
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="quotation-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Date</th>
                                    <th>Company</th>
                                    <th>Tours & Travels</th>
                                    <th>Customer</th>
                                    <th>Car Model</th>
                                    <th>Color</th>
                                    <th>RTO</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <span className="order-number">{order.order_number}</span>
                                        </td>
                                        <td>{formatDate(order.order_date)}</td>
                                        <td>{order.company_name}</td>
                                        <td>{order.tours_travels_name}</td>
                                        <td>{order.customer_name}</td>
                                        <td>
                                            {order.car_model}
                                            {order.variant && <span className="variant-badge">{order.variant}</span>}
                                        </td>
                                        <td>
                                            <span className="color-badge">{order.color}</span>
                                        </td>
                                        <td>{order.rto_passing}</td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-icon btn-download"
                                                    onClick={() => handleDownloadPDF(order)}
                                                    title="Download PDF"
                                                >
                                                    📥
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => handleDelete(order.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Summary */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="list-summary">
                        <p>
                            Showing {filteredOrders.length} of {orders.length} booking order(s)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingOrderList;
