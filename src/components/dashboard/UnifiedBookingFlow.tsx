import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import bookingOrderService from '../../services/bookingOrderService';
import receiptService from '../../services/receiptService';
import proformaService from '../../services/proformaService';

const carVariants = {
    'Maruti Suzuki Wagon-R': ['H3 CNG', 'LXI CNG', 'VXI CNG'],
    'Maruti Suzuki ERTIGA': ['Tour M CNG 1.5 MT', 'VXI CNG 1.5 MT', 'ZXI CNG 1.5 MT'],
    'TOYOTA RUMION': ['S CNG 1.5 MT'],
    'HYUNDAI AURA': ['E CNG', 'S CNG', 'SX CNG'],
    'Maruti Suzuki Dzire': ['Tour\'s CNG'],
    'Toyota Innova Crysta': ['GX', 'GX+', 'VX', 'ZX']
};

const carModels = Object.keys(carVariants);

const UnifiedBookingFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Auto-generated numbers
    const [orderNumber, setOrderNumber] = useState('');
    const [proformaSerial, setProformaSerial] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_contact: '',
        customer_address: '',
        customer_email: '',
        company_name: '',
        tours_travels_name: '',
        date: new Date().toISOString().split('T')[0],
        car_model: '',
        variant: '',
        color: '',
        rto_passing: '',
        registration_place: '',
        ex_showroom_price: '',
        reg_service_charges: '',
        insurance_zero_dep: '',
        extended_warranty: '',
        accessories: '',
        tcs: '',
        loyalty_card: '',
        fastag_charges: '',
        consumer_offer: '',
        corporate_offer: '',
        exchange_bonus: '',
        receipt_amount: '',
        payment_mode: '',
        sales_executive_name: '',
        remarks: '',
        hypothecated_to: '',
        bank_name: '',
        loan_amount: '',
        loan_tenure: '',
        emi: '',
        margin_money: '',
        // New Modi Fields
        hypothecation_amount: '',
        safety_package: '',
        acc_package: ''
    });

    useEffect(() => {
        fetchNextNumbers();
    }, []);

    const fetchNextNumbers = async () => {
        try {
            const nextOrder = await bookingOrderService.getNextOrderNumber();
            const nextProforma = await proformaService.getNextSerialNumber();
            setOrderNumber(nextOrder);
            setProformaSerial(nextProforma);
        } catch (error) {
            console.error('Error fetching numbers:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep1 = () => {
        if (!formData.customer_name) { alert('Customer Name is required'); return false; }
        if (!formData.customer_contact) { alert('Contact Number is required'); return false; }
        if (!formData.customer_address) { alert('Address is required'); return false; }
        if (!formData.company_name) { alert('Company Name is required'); return false; }
        if (!formData.tours_travels_name) { alert('Tours & Travels Name is required'); return false; }
        if (!formData.date) { alert('Date is required'); return false; }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.car_model) { alert('Car Model is required'); return false; }
        if (!formData.color) { alert('Color is required'); return false; }
        if (!formData.rto_passing) { alert('RTO Passing is required'); return false; }
        return true;
    };

    const nextStep = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(prev => prev + 1);
    };

    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!formData.company_name || !formData.car_model) {
            alert('Please complete all required fields');
            return;
        }

        setLoading(true);
        try {
            let currentOrderNumber = orderNumber;
            let currentProformaSerial = proformaSerial;

            try {
                const freshOrder = await bookingOrderService.getNextOrderNumber();
                const freshProforma = await proformaService.getNextSerialNumber();
                if (freshOrder !== orderNumber) {
                    console.log(`Order number updated from ${orderNumber} to ${freshOrder}`);
                    currentOrderNumber = freshOrder;
                    setOrderNumber(freshOrder);
                }
                if (freshProforma !== proformaSerial) {
                    console.log(`Proforma serial updated from ${proformaSerial} to ${freshProforma}`);
                    currentProformaSerial = freshProforma;
                    setProformaSerial(freshProforma);
                }
            } catch (e) {
                console.error('Failed to refresh numbers, proceeding with existing state', e);
            }

            const bookingOrderPayload = {
                order_number: currentOrderNumber,
                order_date: formData.date,
                company_name: formData.company_name,
                tours_travels_name: formData.tours_travels_name,
                car_model: formData.car_model,
                variant: formData.variant || 'Base',
                color: formData.color,
                rto_passing: formData.rto_passing,
                customer_name: formData.customer_name,
                customer_contact: formData.customer_contact,
                customer_address: formData.customer_address
            };

            let orderRes;
            try {
                orderRes = await bookingOrderService.createBookingOrder(bookingOrderPayload);
            } catch (err: any) {
                if (err.message && err.message.includes('duplicate')) {
                    console.log('Duplicate detected, retrying with incremented number...');
                    const retryOrder = await bookingOrderService.getNextOrderNumber();
                    throw new Error('Order number conflict. Please try clicking Generate again to refresh.');
                }
                throw err;
            }

            if (formData.receipt_amount && parseFloat(formData.receipt_amount) > 0) {
                const receiptPayload = {
                    receipt_number: currentOrderNumber,
                    receipt_date: formData.date,
                    customer_name: formData.customer_name,
                    customer_address: formData.customer_address,
                    mobile_number: formData.customer_contact,
                    car_model: formData.car_model,
                    variant: formData.variant,
                    sales_executive_name: formData.sales_executive_name || 'N/A',
                    receipt_amount: parseFloat(formData.receipt_amount),
                    payment_mode: formData.payment_mode || 'Cash',
                    remarks: formData.remarks,
                    hypothecated_to: formData.hypothecated_to
                };
                await receiptService.createReceipt(receiptPayload);
            }

            const proformaPayload = {
                serial_number: currentProformaSerial,
                proforma_date: formData.date,
                customer_name: formData.customer_name,
                customer_address: formData.customer_address,
                customer_contact: formData.customer_contact,
                customer_email: formData.customer_email,
                car_model: formData.car_model,
                registration_place: formData.registration_place || formData.rto_passing,
                ex_showroom_price: formData.ex_showroom_price || 0,
                reg_service_charges: formData.reg_service_charges || 0,
                insurance_zero_dep: formData.insurance_zero_dep || 0,
                extended_warranty: formData.extended_warranty || 0,
                accessories: formData.accessories || 0,
                tcs: formData.tcs || 0,
                loyalty_card: formData.loyalty_card || 0,
                fastag_charges: formData.fastag_charges || 0,
                consumer_offer: formData.consumer_offer || 0,
                corporate_offer: formData.corporate_offer || 0,
                exchange_bonus: formData.exchange_bonus || 0,

                // New Modi Fields
                hypothecation_amount: formData.hypothecation_amount || 0,
                safety_package: formData.safety_package || 0,
                acc_package: formData.acc_package || 0,

                bank_name: formData.bank_name,
                loan_tenure: formData.loan_tenure,
                loan_amount: formData.loan_amount || 0,
                margin_money: formData.margin_money || 0,
                emi: formData.emi || 0,
                booking_order_id: orderRes.id
            };
            await proformaService.createProformaInvoice(proformaPayload);

            alert('All Documents Generated Successfully!');
            navigate('/dashboard/all-documents');

        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Error generating documents. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard-container">
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                padding: '0.6rem 1rem',
                marginBottom: '0.5rem',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
            }}>
                <h1 style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: 'white',
                    margin: '0 0 0.2rem 0'
                }}>Create Order–Receipt–Proforma</h1>
                <p style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: 0
                }}>Generate all documents in one streamlined flow</p>
            </div>

            <div className="quotation-form-container" style={{ padding: '0.5rem' }}>
                <div className="receipt-form">
                    <div className="form-section" style={{ marginBottom: '0.5rem', padding: '0.5rem' }}>
                        <div className="form-grid" style={{ gap: '0.5rem' }}>
                            <div className="form-group highlight-bg">
                                <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Booking Order #</label>
                                <input value={orderNumber} readOnly className="form-control readonly" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                            </div>
                            <div className="form-group highlight-bg">
                                <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Proforma Serial #</label>
                                <input value={proformaSerial} readOnly className="form-control readonly" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                            </div>
                            <div className="form-group highlight-bg">
                                <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Receipt #</label>
                                <input value={orderNumber} readOnly className="form-control readonly" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                <small style={{ fontSize: '0.7rem' }}>Synced with Order #</small>
                            </div>
                        </div>
                    </div>

                    {step === 1 && (
                        <div className="form-section fade-in" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Step 1: Customer & Company Details</h3>
                            <div className="form-grid" style={{ gap: '0.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Customer Name *</label>
                                    <input name="customer_name" value={formData.customer_name} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Contact Number *</label>
                                    <input name="customer_contact" value={formData.customer_contact} onChange={handleChange} className="form-control" maxLength={10} style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group full-width">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Address *</label>
                                    <textarea name="customer_address" value={formData.customer_address} onChange={handleChange} className="form-control" rows={2} style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Email</label>
                                    <input name="customer_email" value={formData.customer_email} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Company Name *</label>
                                    <input
                                        type="text"
                                        name="company_name"
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="form-control"
                                        placeholder="Enter company name"
                                        style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Tours & Travels Name *</label>
                                    <input name="tours_travels_name" value={formData.tours_travels_name} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Date *</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                            </div>
                            <div className="form-actions right" style={{ marginTop: '0.6rem' }}>
                                <button className="btn btn-primary" onClick={nextStep} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>Next: Vehicle Details →</button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="form-section fade-in" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Step 2: Vehicle Details</h3>
                            <div className="form-grid" style={{ gap: '0.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Car Model *</label>
                                    <select name="car_model" value={formData.car_model} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                                        <option value="">Select Model</option>
                                        {carModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Variant</label>
                                    <select name="variant" value={formData.variant} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                                        <option value="">Select Variant</option>
                                        {formData.car_model && carVariants[formData.car_model as keyof typeof carVariants]?.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Color *</label>
                                    <input name="color" value={formData.color} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>RTO Passing *</label>
                                    <input name="rto_passing" value={formData.rto_passing} onChange={handleChange} className="form-control" placeholder="MH-XX" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Registration Place (Proforma)</label>
                                    <input name="registration_place" value={formData.registration_place} onChange={handleChange} className="form-control" placeholder="Same as RTO if empty" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                            </div>
                            <div className="form-actions spaced" style={{ marginTop: '0.6rem' }}>
                                <button className="btn btn-secondary" onClick={prevStep} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>← Back</button>
                                <button className="btn btn-primary" onClick={nextStep} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>Next: Payment & Pricing →</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="form-section fade-in" style={{ padding: '0.5rem', marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Step 3: Payment & Pricing Details</h3>

                            <h4 style={{ fontSize: '0.95rem', marginTop: '0.6rem', marginBottom: '0.4rem' }}>Receipt Details (Initial Payment)</h4>
                            <div className="form-grid" style={{ gap: '0.5rem' }}>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Amount (₹)</label>
                                    <input type="number" name="receipt_amount" value={formData.receipt_amount} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Payment Mode</label>
                                    <select name="payment_mode" value={formData.payment_mode} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }}>
                                        <option value="">Select Mode</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Online Transfer">Online Transfer</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}>Sales Executive</label>
                                    <input name="sales_executive_name" value={formData.sales_executive_name} onChange={handleChange} className="form-control" style={{ padding: '0.4rem', fontSize: '0.85rem' }} />
                                </div>
                            </div>

                            <h4 style={{ fontSize: '0.95rem', marginTop: '0.6rem', marginBottom: '0.4rem' }}>Proforma Pricing (Optional)</h4>
                            <div className="compact-form-grid" style={{ gap: '0.4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Ex-Showroom</label>
                                    <input type="number" name="ex_showroom_price" value={formData.ex_showroom_price} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Discount (Consumer Offer)</label>
                                    <input type="number" name="consumer_offer" value={formData.consumer_offer} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Insurance</label>
                                    <input type="number" name="insurance_zero_dep" value={formData.insurance_zero_dep} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Registration</label>
                                    <input type="number" name="reg_service_charges" value={formData.reg_service_charges} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Hypothecation Amount</label>
                                    <input type="number" name="hypothecation_amount" value={formData.hypothecation_amount} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Fastag Charges</label>
                                    <input type="number" name="fastag_charges" value={formData.fastag_charges} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Accessories / GPS</label>
                                    <input type="number" name="accessories" value={formData.accessories} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Safety Package</label>
                                    <input type="number" name="safety_package" value={formData.safety_package} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>ACC Package</label>
                                    <input type="number" name="acc_package" value={formData.acc_package} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Bank Name</label>
                                    <input name="bank_name" value={formData.bank_name} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Loan Amount</label>
                                    <input type="number" name="loan_amount" value={formData.loan_amount} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                                <div className="form-group row-group">
                                    <label style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>TCS 1%</label>
                                    <input type="number" name="tcs" value={formData.tcs} onChange={handleChange} className="form-control" style={{ padding: '0.4rem' }} />
                                </div>
                            </div>

                            <div className="form-actions spaced" style={{ marginTop: '0.6rem' }}>
                                <button className="btn btn-secondary" onClick={prevStep} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>← Back</button>
                                <button className="btn btn-success" onClick={handleSubmit} disabled={loading} style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}>
                                    {loading ? 'Generating...' : '✓ Generate All Documents'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnifiedBookingFlow;
