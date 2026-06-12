import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import bookingOrderService from '../../services/bookingOrderService';
import { generateBookingOrderPDF } from '../../utils/bookingOrderPdfGenerator';

interface BookingOrderFormData {
    orderNumber: string;
    orderDate: string;
    companyName: string;
    toursAndTravelsName: string;
    carModel: string;
    variant: string;
    color: string;
    rtoPassing: string;
    customerName: string;
    customerContact: string;
    customerAddress: string;
}

interface FormErrors {
    [key: string]: string;
}



// Car variants data (same as receipt)
const carVariants = {
    'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
    'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
    'TOYOTA RUMION': ['S CNG 1.5 MT'],
    'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
    'Maruti Suzuki Dzire': ['Tour\'s CNG'],
    'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

const carModels = Object.keys(carVariants);

// Color options
const colorOptions = [
    'White',
    'Black',
    'Silver',
    'Grey',
    'Red',
    'Blue',
    'Brown',
    'Beige',
    'Green',
    'Orange'
];

// RTO Passing options (Maharashtra)
const rtoPassingOptions = [
    'MH-01',
    'MH-02',
    'MH-03',
    'MH-04',
    'MH-05',
    'MH-06',
    'MH-12',
    'MH-43',
    'MH-46',
    'MH-47',
    'MH-48',
    'MH-58'
];

const BookingOrder: React.FC = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [nextOrderNumber, setNextOrderNumber] = useState<string>('BO0522');

    const [formData, setFormData] = useState<BookingOrderFormData>({
        orderNumber: '',
        orderDate: new Date().toISOString().split('T')[0],
        companyName: '',
        toursAndTravelsName: '',
        carModel: '',
        variant: '',
        color: '',
        rtoPassing: '',
        customerName: '',
        customerContact: '',
        customerAddress: ''
    });

    // Fetch next order number
    useEffect(() => {
        fetchNextOrderNumber();
    }, []);

    const fetchNextOrderNumber = async () => {
        try {
            const number = await bookingOrderService.getNextOrderNumber();
            setNextOrderNumber(number);
            setFormData(prev => ({ ...prev, orderNumber: number }));
        } catch (error) {
            console.error('Error fetching order number:', error);
        }
    };

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // If car model changes, reset variant
        if (name === 'carModel') {
            setFormData({
                ...formData,
                [name]: value,
                variant: ''
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company name is required';
        }

        if (!formData.toursAndTravelsName.trim()) {
            newErrors.toursAndTravelsName = 'Tours & travels name is required';
        }

        if (!formData.carModel) {
            newErrors.carModel = 'Car model is required';
        }

        if (!formData.color) {
            newErrors.color = 'Color is required';
        }

        if (!formData.rtoPassing) {
            newErrors.rtoPassing = 'RTO passing is required';
        }

        if (!formData.customerName.trim()) {
            newErrors.customerName = 'Customer name is required';
        }

        if (!formData.customerContact.trim()) {
            newErrors.customerContact = 'Customer contact number is required';
        } else if (!/^\d{10}$/.test(formData.customerContact.replace(/\D/g, ''))) {
            // Basic validation for 10 digits
            newErrors.customerContact = 'Please enter a valid 10-digit contact number';
        }

        if (!formData.customerAddress.trim()) {
            newErrors.customerAddress = 'Customer address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const orderData = {
                order_number: formData.orderNumber,
                order_date: formData.orderDate,
                company_name: formData.companyName,
                tours_travels_name: formData.toursAndTravelsName,
                car_model: formData.carModel,
                variant: formData.variant,
                color: formData.color,
                rto_passing: formData.rtoPassing,
                customer_name: formData.customerName,
                customer_contact: formData.customerContact,
                customer_address: formData.customerAddress
            };

            await bookingOrderService.createBookingOrder(orderData);
            setSubmitSuccess(true);

            setTimeout(() => {
                navigate('/dashboard/booking-orders');
            }, 2000);

        } catch (error) {
            console.error('Error creating booking order:', error);
            setErrors({ submit: 'Failed to create booking order. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle download PDF
    const handleDownloadPDF = async () => {
        if (!validateForm()) {
            return;
        }
        try {
            await generateBookingOrderPDF({
                orderNumber: formData.orderNumber,
                orderDate: formData.orderDate,
                companyName: formData.companyName,
                toursAndTravelsName: formData.toursAndTravelsName,
                carModel: formData.carModel,
                variant: formData.variant,
                color: formData.color,
                rtoPassing: formData.rtoPassing,
                customerName: formData.customerName,
                customerContact: formData.customerContact,
                customerAddress: formData.customerAddress
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    // Reset form
    const handleReset = () => {
        setFormData({
            orderNumber: nextOrderNumber,
            orderDate: new Date().toISOString().split('T')[0],
            companyName: '',
            toursAndTravelsName: '',
            carModel: '',
            variant: '',
            color: '',
            rtoPassing: '',
            customerName: '',
            customerContact: '',
            customerAddress: ''
        });
        setErrors({});
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-welcome">
                <h1>Create Booking Order</h1>
                <p>Generate booking order for customers</p>
            </div>

            <div className="quotation-form-container">
                <form onSubmit={handleSubmit} className="receipt-form">
                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="success-message">
                            <strong>✓ Booking order created successfully!</strong>
                            <p>Order #{formData.orderNumber} has been saved.</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {errors.submit && (
                        <div className="error-banner">
                            <div className="error-icon">⚠️</div>
                            <div className="error-text">
                                <strong>Error:</strong> {errors.submit}
                            </div>
                        </div>
                    )}

                    {/* Order Header Section */}
                    <div className="form-section">
                        <h3>Order Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Order Number <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="orderNumber"
                                    value={formData.orderNumber}
                                    className="form-control readonly"
                                    readOnly
                                />
                            </div>

                            <div className="form-group">
                                <label>Order Date <span className="required">*</span></label>
                                <input
                                    type="date"
                                    name="orderDate"
                                    value={formData.orderDate}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Company Information Section */}
                    <div className="form-section">
                        <h3>Company Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Company Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.companyName ? 'error' : ''}`}
                                    placeholder="Enter company name"
                                    required
                                />
                                {errors.companyName && <span className="error-text">{errors.companyName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Name of Tours & Travels <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="toursAndTravelsName"
                                    value={formData.toursAndTravelsName}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.toursAndTravelsName ? 'error' : ''}`}
                                    placeholder="Enter tours & travels name"
                                    required
                                />
                                {errors.toursAndTravelsName && <span className="error-text">{errors.toursAndTravelsName}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details Section */}
                    <div className="form-section">
                        <h3>Vehicle Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Car Model <span className="required">*</span></label>
                                <select
                                    name="carModel"
                                    value={formData.carModel}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.carModel ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">-- Select Car Model --</option>
                                    {carModels.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                                {errors.carModel && <span className="error-text">{errors.carModel}</span>}
                            </div>

                            <div className="form-group">
                                <label>Variant</label>
                                <select
                                    name="variant"
                                    value={formData.variant}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!formData.carModel}
                                >
                                    <option value="">-- Select Variant --</option>
                                    {formData.carModel && carVariants[formData.carModel as keyof typeof carVariants]?.map(variant => (
                                        <option key={variant} value={variant}>{variant}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Color <span className="required">*</span></label>
                                <select
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.color ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">-- Select Color --</option>
                                    {colorOptions.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                    ))}
                                </select>
                                {errors.color && <span className="error-text">{errors.color}</span>}
                            </div>

                            <div className="form-group">
                                <label>RTO Passing <span className="required">*</span></label>
                                <select
                                    name="rtoPassing"
                                    value={formData.rtoPassing}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.rtoPassing ? 'error' : ''}`}
                                    required
                                >
                                    <option value="">-- Select RTO --</option>
                                    {rtoPassingOptions.map(rto => (
                                        <option key={rto} value={rto}>{rto}</option>
                                    ))}
                                </select>
                                {errors.rtoPassing && <span className="error-text">{errors.rtoPassing}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Section */}
                    <div className="form-section">
                        <h3>Customer Information</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Customer Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.customerName ? 'error' : ''}`}
                                    placeholder="Enter customer name"
                                    required
                                />
                                {errors.customerName && <span className="error-text">{errors.customerName}</span>}
                            </div>

                            <div className="form-group">
                                <label>Customer Contact Number <span className="required">*</span></label>
                                <input
                                    type="tel"
                                    name="customerContact"
                                    value={formData.customerContact}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.customerContact ? 'error' : ''}`}
                                    placeholder="Enter contact number"
                                    maxLength={10}
                                    required
                                />
                                {errors.customerContact && <span className="error-text">{errors.customerContact}</span>}
                            </div>

                            <div className="form-group full-width">
                                <label>Customer Address <span className="required">*</span></label>
                                <textarea
                                    name="customerAddress"
                                    value={formData.customerAddress}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.customerAddress ? 'error' : ''}`}
                                    placeholder="Enter customer address"
                                    rows={3}
                                    required
                                />
                                {errors.customerAddress && <span className="error-text">{errors.customerAddress}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleReset}
                            disabled={isSubmitting}
                        >
                            Reset Form
                        </button>
                        <button
                            type="button"
                            className="btn btn-info"
                            onClick={handleDownloadPDF}
                            disabled={isSubmitting}
                        >
                            Download PDF
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || submitSuccess}
                        >
                            {isSubmitting ? 'Saving...' : submitSuccess ? 'Saved ✓' : 'Save Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingOrder;
