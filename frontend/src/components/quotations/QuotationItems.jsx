"use client";

import React, { useMemo } from "react";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value?._id || value?.id || "";
};

const getProductName = (product) => {
  if (!product) return "";

  return (
    product.name ||
    product.productName ||
    product.title ||
    product.model ||
    "Unnamed Product"
  );
};

const getProductPrice = (product) => {
  if (!product) return 0;

  return Number(
    product.salePrice ??
      product.sellingPrice ??
      product.unitPrice ??
      product.price ??
      0
  );
};

const createEmptyItem = () => ({
  productId: "",
  description: "",
  quantity: 1,
  unit: "PCS",
  unitPrice: 0,
  discountAmount: 0,
  total: 0,
});

const QuotationItems = ({
  items = [],
  products = [],
  onChange,
  disabled = false,
  error = "",
}) => {
  const safeItems = Array.isArray(items)
    ? items
    : [];

  const productOptions = useMemo(
    () => [
      {
        value: "",
        label: "Select product",
      },
      ...(Array.isArray(products)
        ? products
            .map((product) => {
              const id = getId(product);

              return {
                value: id,
                label: getProductName(product),
              };
            })
            .filter((item) => item.value)
        : []),
    ],
    [products]
  );

  const findProduct = (productId) => {
    if (!productId) return null;

    return (
      products.find(
        (product) =>
          getId(product) === productId
      ) || null
    );
  };

  const calculateItemTotal = (item) => {
    const quantity =
      Number(item?.quantity) || 0;

    const unitPrice =
      Number(item?.unitPrice) || 0;

    const discount =
      Number(item?.discountAmount) || 0;

    return Math.max(
      quantity * unitPrice - discount,
      0
    );
  };

  const updateItems = (nextItems) => {
    if (typeof onChange === "function") {
      onChange(nextItems);
    }
  };

  const handleProductChange = (
    index,
    productId
  ) => {
    const product = findProduct(productId);

    const nextItems = [...safeItems];

    const currentItem =
      nextItems[index] || createEmptyItem();

    const unitPrice =
      getProductPrice(product);

    nextItems[index] = {
      ...currentItem,
      productId,
      description:
        currentItem.description ||
        product?.description ||
        getProductName(product),
      unit:
        currentItem.unit ||
        product?.unit ||
        "PCS",
      unitPrice,
      total: calculateItemTotal({
        ...currentItem,
        unitPrice,
      }),
    };

    updateItems(nextItems);
  };

  const handleFieldChange = (
    index,
    field,
    value
  ) => {
    const nextItems = [...safeItems];

    const currentItem =
      nextItems[index] || createEmptyItem();

    const updatedItem = {
      ...currentItem,
      [field]: value,
    };

    if (
      field === "quantity" ||
      field === "unitPrice" ||
      field === "discountAmount"
    ) {
      updatedItem.total =
        calculateItemTotal(
          updatedItem
        );
    }

    nextItems[index] = updatedItem;

    updateItems(nextItems);
  };

  const handleAddItem = () => {
    updateItems([
      ...safeItems,
      createEmptyItem(),
    ]);
  };

  const handleRemoveItem = (index) => {
    if (safeItems.length === 1) {
      updateItems([]);
      return;
    }

    updateItems(
      safeItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const grandItemsTotal = safeItems.reduce(
    (total, item) =>
      total +
      calculateItemTotal(item),
    0
  );

  return (
    <div className="quotation-items">
      <div className="quotation-items-header">
        <div>
          <h3>Items</h3>
          <p>
            Add products or services to the
            quotation.
          </p>
        </div>

        <button
          type="button"
          className="quotation-items-add-button"
          onClick={handleAddItem}
          disabled={disabled}
        >
          + Add Item
        </button>
      </div>

      {error && (
        <div className="quotation-items-error">
          {error}
        </div>
      )}

      {safeItems.length === 0 ? (
        <div className="quotation-items-empty">
          <div className="quotation-items-empty-icon">
            +
          </div>

          <h4>No quotation items</h4>

          <p>
            Add at least one product or service
            to continue.
          </p>

          <button
            type="button"
            className="quotation-items-empty-button"
            onClick={handleAddItem}
            disabled={disabled}
          >
            Add First Item
          </button>
        </div>
      ) : (
        <>
          <div className="quotation-items-list">
            {safeItems.map(
              (item, index) => {
                const product =
                  findProduct(
                    getId(item.productId)
                  );

                const itemTotal =
                  calculateItemTotal(
                    item
                  );

                return (
                  <div
                    className="quotation-item"
                    key={
                      item.id ||
                      item._id ||
                      `quotation-item-${index}`
                    }
                  >
                    <div className="quotation-item-header">
                      <div className="quotation-item-number">
                        Item {index + 1}
                      </div>

                      <button
                        type="button"
                        className="quotation-item-remove"
                        onClick={() =>
                          handleRemoveItem(
                            index
                          )
                        }
                        disabled={disabled}
                        aria-label={`Remove item ${
                          index + 1
                        }`}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="quotation-item-grid">
                      <div className="quotation-item-field quotation-item-product">
                        <Select
                          label="Product"
                          value={
                            getId(
                              item.productId
                            )
                          }
                          onChange={(event) =>
                            handleProductChange(
                              index,
                              event.target
                                .value
                            )
                          }
                          options={
                            productOptions
                          }
                          placeholder="Select product"
                          disabled={
                            disabled
                          }
                        />
                      </div>

                      <div className="quotation-item-field">
                        <Input
                          label="Description"
                          value={
                            item.description ||
                            ""
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              index,
                              "description",
                              event.target
                                .value
                            )
                          }
                          placeholder="Enter item description"
                          disabled={
                            disabled
                          }
                        />
                      </div>

                      <div className="quotation-item-field">
                        <Input
                          label="Quantity"
                          type="number"
                          value={
                            item.quantity ??
                            ""
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              index,
                              "quantity",
                              event.target
                                .value
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="Enter quantity"
                          disabled={
                            disabled
                          }
                        />
                      </div>

                      <div className="quotation-item-field">
                        <Input
                          label="Unit"
                          value={
                            item.unit ||
                            "PCS"
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              index,
                              "unit",
                              event.target
                                .value
                            )
                          }
                          placeholder="PCS"
                          disabled={
                            disabled
                          }
                        />
                      </div>

                      <div className="quotation-item-field">
                        <Input
                          label="Unit Price"
                          type="number"
                          value={
                            item.unitPrice ??
                            ""
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              index,
                              "unitPrice",
                              event.target
                                .value
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="Enter unit price"
                          disabled={
                            disabled
                          }
                        />
                      </div>

                      <div className="quotation-item-field">
                        <Input
                          label="Discount"
                          type="number"
                          value={
                            item.discountAmount ??
                            0
                          }
                          onChange={(event) =>
                            handleFieldChange(
                              index,
                              "discountAmount",
                              event.target
                                .value
                            )
                          }
                          min="0"
                          step="0.01"
                          placeholder="Enter discount"
                          disabled={
                            disabled
                          }
                        />
                      </div>
                    </div>

                    <div className="quotation-item-footer">
                      {product && (
                        <span className="quotation-item-product-info">
                          {getProductName(
                            product
                          )}
                        </span>
                      )}

                      <div className="quotation-item-total">
                        <span>Item Total</span>
                        <strong>
                          {formatCurrency(
                            itemTotal
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="quotation-items-total">
            <span>
              Items Subtotal
            </span>

            <strong>
              {formatCurrency(
                grandItemsTotal
              )}
            </strong>
          </div>
        </>
      )}
    </div>
  );
};

export default QuotationItems;