import { numberToIndianWords } from '../utils/numberToWords';

export interface VeloxPaymentItem {
  id: string;
  srl: number;
  mode: string;             // CASH / CHEQUE / DD / NEFT / RTGS / UPI
  dd_chq_no: string;        // DD/CC/CHQ No. (e.g. "." or "CHQ49201")
  date: string;             // DD/MM/YYYY or YYYY-MM-DD
  favouring: string;        // Favouring (e.g. "." or "VELOX MOTORS PVT LTD")
  drawn_on: string;         // Drawn On (e.g. "." or "HDFC BANK")
  deposit_bank: string;     // Deposit Bank Name (e.g. "Sbi Bank" / "Hdfc Bank")
  amount: number;           // Amount in INR (e.g. 60000)
}

export interface VeloxReceiptData {
  id: string;
  receipt_no: string;       // e.g. "REC26003365"
  receipt_date: string;     // e.g. "09/10/2026"
  customer_id: string;      // e.g. "2671206942"
  name: string;             // e.g. "M/S Zubiya Tours And Travels"
  address: string;          // Multiline address
  receipt_amount: number;   // Total amount e.g. 60000
  hypothecated_to: string;  // e.g. "HDFC BANK LTD."
  financer_name: string;    // e.g. "HDFC BANK LTD."
  remarks: string;          // e.g. "Payment received from Mohammad H (through CASH) Proprietor of Zubiya T&T."
  order_inv_no?: string;    // Order/Inv No.
  model?: string;           // Model (e.g. "Maruti Suzuki Ertiga VXI CNG")
  tl_name?: string;         // TL Name
  dse_name?: string;        // DSE Name
  
  items: VeloxPaymentItem[]; // Table of payment line items
  
  total_amount: number;     // e.g. 60000
  amount_in_words: string;  // e.g. "Rupees Sixty Thousand Only"
  terms_conditions?: string;
  rel_version?: string;     // default "Rel 2.0.12"
  
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'velox_bank_receipts_v1';

// Initial sample matching the user's uploaded document
const INITIAL_SAMPLE_RECEIPT: VeloxReceiptData = {
  id: 'velox-sample-1',
  receipt_no: 'REC26003365',
  receipt_date: '09/10/2026',
  customer_id: '2671206942',
  name: 'M/S Zubiya Tours And Travels',
  address: 'S No 59 Adarsh Nagar, Tungaershwar Road Sativall, Vasai Road Vasai (E) Palghar\nPalghar\nPin:401404',
  receipt_amount: 60000,
  hypothecated_to: 'HDFC BANK LTD.',
  financer_name: 'HDFC BANK LTD.',
  remarks: 'Payment received from Mohammad H (through CASH) Proprietor of Zubiya T&T.',
  order_inv_no: '',
  model: '',
  tl_name: '',
  dse_name: '',
  items: [
    {
      id: 'item-1',
      srl: 1,
      mode: 'CASH',
      dd_chq_no: '.',
      date: '09/10/2026',
      favouring: '',
      drawn_on: '.',
      deposit_bank: 'Sbi Bank',
      amount: 60000
    }
  ],
  total_amount: 60000,
  amount_in_words: 'Rupees Sixty Thousand Only',
  terms_conditions: '',
  rel_version: 'Rel 2.0.12',
  created_at: new Date('2026-10-09T10:30:00Z').toISOString(),
  updated_at: new Date('2026-10-09T10:30:00Z').toISOString()
};

const getStoredReceipts = (): VeloxReceiptData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_SAMPLE_RECEIPT]));
      return [INITIAL_SAMPLE_RECEIPT];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_SAMPLE_RECEIPT]));
    return [INITIAL_SAMPLE_RECEIPT];
  } catch (e) {
    console.error('Error reading velox receipts from localStorage:', e);
    return [INITIAL_SAMPLE_RECEIPT];
  }
};

const saveStoredReceipts = (receipts: VeloxReceiptData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  } catch (e) {
    console.error('Error writing velox receipts to localStorage:', e);
  }
};

export const veloxReceiptService = {
  /**
   * Get all Velox receipts
   */
  async getAllReceipts(): Promise<VeloxReceiptData[]> {
    return getStoredReceipts();
  },

  /**
   * Get a single receipt by ID
   */
  async getReceiptById(id: string): Promise<VeloxReceiptData | null> {
    const list = getStoredReceipts();
    return list.find(r => r.id === id || r.receipt_no === id) || null;
  },

  /**
   * Generate next sequential receipt number (e.g. REC26003366)
   */
  async getNextReceiptNumber(): Promise<string> {
    const list = getStoredReceipts();
    if (list.length === 0) return 'REC26003365';

    // Find the highest number in existing receipts
    let maxNum = 26003365;
    list.forEach(r => {
      const match = r.receipt_no.match(/REC(\d+)/i);
      if (match && match[1]) {
        const val = parseInt(match[1], 10);
        if (val > maxNum) maxNum = val;
      }
    });

    return `REC${maxNum + 1}`;
  },

  /**
   * Create a new receipt
   */
  async createReceipt(data: Partial<VeloxReceiptData>): Promise<VeloxReceiptData> {
    const list = getStoredReceipts();

    const total = (data.items && data.items.length > 0)
      ? data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      : (Number(data.receipt_amount) || 0);

    const receiptNo = data.receipt_no || await this.getNextReceiptNumber();

    const newReceipt: VeloxReceiptData = {
      id: `velox-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      receipt_no: receiptNo,
      receipt_date: data.receipt_date || new Date().toLocaleDateString('en-GB'),
      customer_id: data.customer_id || `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      name: data.name || 'Customer Name',
      address: data.address || '',
      receipt_amount: total,
      hypothecated_to: data.hypothecated_to || 'HDFC BANK LTD.',
      financer_name: data.financer_name || 'HDFC BANK LTD.',
      remarks: data.remarks || '',
      order_inv_no: data.order_inv_no || '',
      model: data.model || '',
      tl_name: data.tl_name || '',
      dse_name: data.dse_name || '',
      items: data.items && data.items.length > 0 ? data.items : [
        {
          id: 'item-1',
          srl: 1,
          mode: 'CASH',
          dd_chq_no: '.',
          date: data.receipt_date || new Date().toLocaleDateString('en-GB'),
          favouring: '',
          drawn_on: '.',
          deposit_bank: 'Sbi Bank',
          amount: total
        }
      ],
      total_amount: total,
      amount_in_words: data.amount_in_words || numberToIndianWords(total),
      terms_conditions: data.terms_conditions || '',
      rel_version: data.rel_version || 'Rel 2.0.12',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    list.unshift(newReceipt);
    saveStoredReceipts(list);
    return newReceipt;
  },

  /**
   * Update an existing receipt
   */
  async updateReceipt(id: string, data: Partial<VeloxReceiptData>): Promise<VeloxReceiptData> {
    const list = getStoredReceipts();
    const index = list.findIndex(r => r.id === id || r.receipt_no === id);

    if (index === -1) {
      throw new Error(`Velox Receipt with ID ${id} not found`);
    }

    const current = list[index];
    const total = (data.items && data.items.length > 0)
      ? data.items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
      : (data.receipt_amount !== undefined ? Number(data.receipt_amount) : current.total_amount);

    const updated: VeloxReceiptData = {
      ...current,
      ...data,
      total_amount: total,
      receipt_amount: total,
      amount_in_words: data.amount_in_words || numberToIndianWords(total),
      updated_at: new Date().toISOString()
    };

    list[index] = updated;
    saveStoredReceipts(list);
    return updated;
  },

  /**
   * Delete a receipt
   */
  async deleteReceipt(id: string): Promise<boolean> {
    const list = getStoredReceipts();
    const filtered = list.filter(r => r.id !== id && r.receipt_no !== id);
    saveStoredReceipts(filtered);
    return true;
  }
};

export default veloxReceiptService;
