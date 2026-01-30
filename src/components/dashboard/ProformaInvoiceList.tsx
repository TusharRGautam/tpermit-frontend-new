import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import './TableBorders.css';
import proformaService from '../../services/proformaService';
import { generateProformaInvoicePDF } from '../../utils/proformaPdfGenerator';

interface ProformaInvoice {
    id: string;
    serial_number: string;
    proforma_date: string;
    customer_name: string;
    customer_address: string;
    customer_contact: string;
    customer_email: string;
    car_model: string;
    registration_place?: string;
    ex_showroom_price?: number;
    reg_service_charges?: number;
    insurance_zero_dep?: number;
    extended_warranty?: number;
    accessories?: number;
    tcs?: number;
    loyalty_card?: number;
    fastag_charges?: number;
    consumer_offer?: number;
    corporate_offer?: number;
    exchange_bonus?: number;
    bank_name?: string;
    loan_tenure?: string;
    cost_of_vehicle?: number;
    loan_amount?: number;
    margin_money?: number;
    emi?: number;
    finance_insurance?: number;
    finance_fastag?: number;
    finance_ew?: number;
    finance_registration?: number;
    finance_accessories?: number;
    stamp_duty_pf?: number;
    finance_corporate_offer?: number;
    finance_msil_offer?: number;
    // New Modi Fields
    hypothecation_amount?: number;
    safety_package?: number;
    acc_package?: number;
    booking_orders?: {
        company_name: string;
    };
}


const ProformaInvoiceList = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<ProformaInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<ProformaInvoice | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const data = await proformaService.getAllProformaInvoices();
            setInvoices(data);
        } catch (error) {
            console.error('Error fetching proforma invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (invoice: ProformaInvoice) => {
        setSelectedInvoice(invoice);
        // Map nested company_name for the form
        setEditFormData({
            ...invoice,
            company_name: invoice.booking_orders?.company_name || '',
            // Ensure date is in YYYY-MM-DD format for input type="date"
            proforma_date: invoice.proforma_date ? new Date(invoice.proforma_date).toISOString().split('T')[0] : ''
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!selectedInvoice) return;
        try {
            // Re-map company_name back to booking_orders if it was flattened for the form
            const dataToUpdate = { ...editFormData };
            if (dataToUpdate.company_name !== undefined) {
                dataToUpdate.booking_orders = { company_name: dataToUpdate.company_name };
                delete dataToUpdate.company_name; // Remove the flattened field
            }

            await proformaService.updateProformaInvoice(selectedInvoice.id, dataToUpdate);
            setIsEditModalOpen(false);
            fetchInvoices();
            alert('Proforma Invoice Updated Successfully');
        } catch (error) {
            console.error('Error updating proforma invoice:', error);
            alert('Failed to update proforma invoice');
        }
    };

    const handleDownload = async (invoice: ProformaInvoice) => {
        try {
            // Need to map backend data layout to PDF generator expected format
            // The PDF generator expects specific field names (camelCase usually matching form)
            // We might need a mapper here.
            const mappedData: any = {
                companyName: invoice.booking_orders?.company_name || '',
                name: invoice.customer_name,
                address: invoice.customer_address,
                contactNo: invoice.customer_contact,
                email: invoice.customer_email || '',
                model: invoice.car_model,
                registration: invoice.registration_place || '',
                date: new Date(invoice.proforma_date).toLocaleDateString('en-GB'),

                exShowroomPrice: String(invoice.ex_showroom_price || ''),
                regServiceCharges: String(invoice.reg_service_charges || ''),
                insuranceZeroDep: String(invoice.insurance_zero_dep || ''),
                extendedWarranty: String(invoice.extended_warranty || ''),
                accessories: String(invoice.accessories || ''),
                tcs: String(invoice.tcs || ''),
                loyaltyCard: String(invoice.loyalty_card || ''),
                fastagCharges: String(invoice.fastag_charges || ''),

                consumerOffer: String(invoice.consumer_offer || ''),
                corporateOffer: String(invoice.corporate_offer || ''),
                exchangeBonus: String(invoice.exchange_bonus || ''),

                bankName: invoice.bank_name || '',
                loanTenure: invoice.loan_tenure || '',
                costOfVehicle: String(invoice.cost_of_vehicle || ''), // If stored
                loanAmount: String(invoice.loan_amount || ''),
                marginMoney: String(invoice.margin_money || ''),
                emi: String(invoice.emi || ''),
                financeInsurance: String(invoice.finance_insurance || ''),
                financeFastag: String(invoice.finance_fastag || ''),
                ew: String(invoice.finance_ew || ''),
                financeRegistration: String(invoice.finance_registration || ''),
                financeAccessories: String(invoice.finance_accessories || ''),
                stampDutyPF: String(invoice.stamp_duty_pf || ''),
                financeCorporateOffer: String(invoice.finance_corporate_offer || ''),
                financeMSILOffer: String(invoice.finance_msil_offer || ''),

                // New Modi Fields
                hypothecationAmount: String(invoice.hypothecation_amount || ''),
                safetyPackage: String(invoice.safety_package || ''),
                accPackage: String(invoice.acc_package || '')
            };

            await generateProformaInvoicePDF(mappedData, invoice.serial_number);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this Proforma Invoice?')) {
            try {
                await proformaService.deleteProformaInvoice(id);
                fetchInvoices();
            } catch (error) {
                console.error('Error deleting proforma:', error);
            }
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="loading-spinner">Loading Proforma Invoices...</div>;

    return (
        <div className="quotation-list-container">
            <div className="quotation-list-controls">
                <div className="search-section">
                    <input
                        className="search-input"
                        placeholder="Search by name or serial #..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="action-section">
                    <button className="refresh-btn" onClick={fetchInvoices}>🔄 Refresh</button>
                    <button className="create-quotation-btn" onClick={() => navigate('/dashboard/unified-entry')}>+ New Entry</button>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="quotations-table-container desktop-table-view">
                <table className="quotations-table">
                    <thead>
                        <tr>
                            <th>Serial #</th>
                            <th>Date</th>
                            <th>Company Name</th>
                            <th>Customer Name</th>
                            <th>Model</th>
                            <th>Contact</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="receipt-number">{inv.serial_number}</td>
                                <td>{new Date(inv.proforma_date).toLocaleDateString()}</td>
                                <td className="highlighted-name">{inv.booking_orders?.company_name || '-'}</td>
                                <td className="highlighted-name">{inv.customer_name}</td>
                                <td>{inv.car_model}</td>
                                <td>{inv.customer_contact}</td>
                                <td className="actions">
                                    <button className="btn-action btn-download" onClick={() => handleDownload(inv)}>Download</button>
                                    <button className="btn-action btn-delete" onClick={() => handleDelete(inv.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center' }}>No proforma invoices found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Mobile Cards (simplified) */}
            <div className="receipts-cards-container mobile-card-view">
                {filteredInvoices.map(inv => (
                    <div key={inv.id} className="receipt-card">
                        <div className="receipt-card-header">
                            <span className="receipt-number">{inv.serial_number}</span>
                            <span className="receipt-date">{new Date(inv.proforma_date).toLocaleDateString()}</span>
                        </div>
                        <div className="receipt-card-body">
                            <div className="customer-name-highlight">{inv.customer_name}</div>
                            <div>{inv.car_model}</div>
                        </div>
                        <div className="receipt-card-actions">
                            <button className="btn-card-action btn-download" onClick={() => handleDownload(inv)}>Download</button>
                            <button className="btn-card-action btn-delete" onClick={() => handleDelete(inv.id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProformaInvoiceList;
