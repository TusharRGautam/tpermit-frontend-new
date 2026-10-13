/**
 * Converts a number to Indian currency words format (Rupees ... Only)
 */
export const numberToIndianWords = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null || num === '') return 'Rupees Zero Only';
  const n = Math.round(typeof num === 'string' ? parseFloat(num) || 0 : num);
  if (n === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelowThousand = (val: number): string => {
    let str = '';
    if (val >= 100) {
      str += singleDigits[Math.floor(val / 100)] + ' Hundred ';
      val %= 100;
    }
    if (val >= 10 && val <= 19) {
      str += twoDigits[val - 10] + ' ';
    } else if (val >= 20) {
      str += tens[Math.floor(val / 10)] + ' ';
      if (val % 10 > 0) {
        str += singleDigits[val % 10] + ' ';
      }
    } else if (val > 0) {
      str += singleDigits[val] + ' ';
    }
    return str.trim();
  };

  const isNegative = n < 0;
  let remaining = Math.abs(n);

  let result = '';

  // Crores (1,00,00,000)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    result += convertBelowThousand(crore) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakhs (1,00,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    result += convertBelowThousand(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousands (1,000)
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    result += convertBelowThousand(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  // Remaining below 1000
  if (remaining > 0) {
    result += convertBelowThousand(remaining) + ' ';
  }

  const cleanWords = result.trim().replace(/\s+/g, ' ');
  return `${isNegative ? 'Minus ' : ''}Rupees ${cleanWords} Only`;
};
