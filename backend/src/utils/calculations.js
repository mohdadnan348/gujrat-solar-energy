const round = (value, decimals = 2) => {
  const number = Number(value) || 0;
  const factor = 10 ** decimals;

  return Math.round((number + Number.EPSILON) * factor) / factor;
};

const calculateAmount = (quantity, rate) => {
  return round(
    (Number(quantity) || 0) *
      (Number(rate) || 0)
  );
};

const calculateSubtotal = (items = []) => {
  if (!Array.isArray(items)) return 0;

  return round(
    items.reduce((total, item) => {
      return (
        total +
        calculateAmount(
          item.quantity,
          item.rate ?? item.price
        )
      );
    }, 0)
  );
};

const calculateTax = (
  amount,
  taxPercentage = 0
) => {
  return round(
    ((Number(amount) || 0) *
      (Number(taxPercentage) || 0)) /
      100
  );
};

const calculateDiscount = (
  amount,
  discountPercentage = 0
) => {
  return round(
    ((Number(amount) || 0) *
      (Number(discountPercentage) || 0)) /
      100
  );
};

const calculateGrandTotal = ({
  subtotal = 0,
  discount = 0,
  tax = 0,
  additionalCharges = 0,
} = {}) => {
  return round(
    (Number(subtotal) || 0) -
      (Number(discount) || 0) +
      (Number(tax) || 0) +
      (Number(additionalCharges) || 0)
  );
};

const calculateGST = (
  amount,
  gstRate = 0
) => {
  const totalTax = calculateTax(
    amount,
    gstRate
  );

  return {
    total: totalTax,
    cgst: round(totalTax / 2),
    sgst: round(totalTax / 2),
  };
};

const calculatePercentage = (
  value,
  percentage
) => {
  return round(
    ((Number(value) || 0) *
      (Number(percentage) || 0)) /
      100
  );
};

module.exports = {
  round,
  calculateAmount,
  calculateSubtotal,
  calculateTax,
  calculateDiscount,
  calculateGrandTotal,
  calculateGST,
  calculatePercentage,
};