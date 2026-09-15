"use client";

import React from "react";
import Button from "../common/Button";
import "./InvoiceItems.css";

const InvoiceItems = ({
  items = [],
  onChange,
  onAdd,
  onRemove,
  readOnly = false,
}) => {
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "rate") {
      const quantity = Number(updatedItems[index].quantity) || 0;
      const rate = Number(updatedItems[index].rate) || 0;

      updatedItems[index].amount = quantity * rate;
    }

    onChange?.(updatedItems);
  };

  const handleAddItem = () => {
    onAdd?.({
      description: "",
      quantity: 1,
      unit: "",
      rate: 0,
      amount: 0,
    });
  };

  const handleRemoveItem = (index) => {
    onRemove?.(index);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      return total + (Number(item.amount) || 0);
    }, 0);
  };

  return (
    <div className="invoice-items">
      <div className="invoice-items__header">
        <div>
          <h3 className="invoice-items__title">Invoice Items</h3>
          <p className="invoice-items__subtitle">
            Add and manage items included in this invoice.
          </p>
        </div>

        {!readOnly && (
          <Button
            type="button"
            variant="primary"
            size="small"
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        )}
      </div>

      <div className="invoice-items__table-wrapper">
        <table className="invoice-items__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
              {!readOnly && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <tr key={item._id || item.id || index}>
                  <td className="invoice-items__number">{index + 1}</td>

                  <td>
                    {readOnly ? (
                      <span>{item.description || "—"}</span>
                    ) : (
                      <input
                        type="text"
                        value={item.description || ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter description"
                        className="invoice-items__input invoice-items__input--description"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span>{item.quantity ?? 0}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity ?? ""}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            e.target.value
                          )
                        }
                        className="invoice-items__input"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span>{item.unit || "—"}</span>
                    ) : (
                      <input
                        type="text"
                        value={item.unit || ""}
                        onChange={(e) =>
                          handleItemChange(index, "unit", e.target.value)
                        }
                        placeholder="Unit"
                        className="invoice-items__input"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span>₹{Number(item.rate || 0).toLocaleString("en-IN")}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate ?? ""}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                        placeholder="0.00"
                        className="invoice-items__input"
                      />
                    )}
                  </td>

                  <td className="invoice-items__amount">
                    ₹
                    {Number(item.amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {!readOnly && (
                    <td>
                      <button
                        type="button"
                        className="invoice-items__remove"
                        onClick={() => handleRemoveItem(index)}
                        aria-label={`Remove item ${index + 1}`}
                        title="Remove item"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={readOnly ? 6 : 7}
                  className="invoice-items__empty"
                >
                  <div className="invoice-items__empty-content">
                    <span className="invoice-items__empty-icon">📄</span>
                    <strong>No invoice items</strong>
                    <p>Add an item to start building this invoice.</p>

                    {!readOnly && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        onClick={handleAddItem}
                      >
                        Add First Item
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div className="invoice-items__footer">
          <span>Total Items</span>
          <strong>{items.length}</strong>

          <span className="invoice-items__footer-label">Subtotal</span>
          <strong>
            ₹
            {calculateTotal().toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </strong>
        </div>
      )}
    </div>
  );
};

export default InvoiceItems;