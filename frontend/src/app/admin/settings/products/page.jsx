"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/app/admin/layout";
import settingService from "@/services/setting.service";
import productService from "@/services/setting.service";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Loader from "@/components/common/Loader";
import Badge from "@/components/common/Badge";
import SearchBox from "@/components/common/SearchBox";
import "./product-settings.css";

const DEFAULT_PRODUCT = {
  name: "",
  code: "",
  category: "Solar Panel",
  capacity: "",
  unit: "Piece",
  price: "",
  description: "",
  status: "ACTIVE",
};

const CATEGORIES = [
  "Solar Panel",
  "Inverter",
  "Battery",
  "Structure",
  "Solar Kit",
  "Accessory",
  "Other",
];

const UNITS = [
  "Piece",
  "Watt",
  "Kilowatt",
  "Set",
  "Unit",
  "Meter",
  "Box",
];

const STATUSES = ["ACTIVE", "INACTIVE"];

const getProducts = (response) => {
  const value = response?.data ?? response;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.products)) return value.products;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;

  return [];
};

const getProductId = (product) =>
  product?._id ||
  product?.id ||
  product?.productId;

const getProductName = (product) =>
  product?.name ||
  product?.productName ||
  "Unnamed Product";

const getProductCode = (product) =>
  product?.code ||
  product?.productCode ||
  "—";

const getProductCategory = (product) =>
  product?.category ||
  product?.type ||
  "Other";

const getProductPrice = (product) =>
  product?.price ??
  product?.unitPrice ??
  product?.sellingPrice ??
  0;

const getProductStatus = (product) =>
  String(
    product?.status ||
      (product?.isActive === false ? "INACTIVE" : "ACTIVE")
  ).toUpperCase();

const formatPrice = (value) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "₹0.00";

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const ProductSettingsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_PRODUCT);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (
        typeof productService.getProducts === "function"
      ) {
        response = await productService.getProducts();
      } else if (
        typeof settingService.getProducts === "function"
      ) {
        response = await settingService.getProducts();
      } else if (
        typeof settingService.getProductSettings === "function"
      ) {
        response =
          await settingService.getProductSettings();
      } else {
        setProducts([]);
        return;
      }

      setProducts(getProducts(response));
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(
        err?.message ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const name = getProductName(product).toLowerCase();
      const code = getProductCode(product).toLowerCase();
      const category = getProductCategory(product);
      const status = getProductStatus(product);

      const matchesSearch =
        !query ||
        name.includes(query) ||
        code.includes(query) ||
        category.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "ALL" ||
        category === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    categoryFilter,
    statusFilter,
  ]);

  const activeCount = products.filter(
    (product) => getProductStatus(product) === "ACTIVE"
  ).length;

  const inactiveCount = products.filter(
    (product) => getProductStatus(product) === "INACTIVE"
  ).length;

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(DEFAULT_PRODUCT);
    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product?.name || product?.productName || "",
      code: product?.code || product?.productCode || "",
      category:
        product?.category ||
        product?.type ||
        "Solar Panel",
      capacity: product?.capacity || "",
      unit: product?.unit || "Piece",
      price:
        product?.price ??
        product?.unitPrice ??
        product?.sellingPrice ??
        "",
      description: product?.description || "",
      status: getProductStatus(product),
    });

    setError("");
    setSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setFormData(DEFAULT_PRODUCT);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Product name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...formData,
        price:
          formData.price === ""
            ? 0
            : Number(formData.price),
      };

      if (editingProduct) {
        const id = getProductId(editingProduct);

        if (
          typeof productService.updateProduct ===
          "function"
        ) {
          await productService.updateProduct(id, payload);
        } else if (
          typeof settingService.updateProduct ===
          "function"
        ) {
          await settingService.updateProduct(id, payload);
        } else {
          throw new Error(
            "Product update method is not available."
          );
        }

        setSuccess("Product updated successfully.");
      } else {
        if (
          typeof productService.createProduct ===
          "function"
        ) {
          await productService.createProduct(payload);
        } else if (
          typeof settingService.createProduct ===
          "function"
        ) {
          await settingService.createProduct(payload);
        } else {
          throw new Error(
            "Product creation method is not available."
          );
        }

        setSuccess("Product created successfully.");
      }

      setModalOpen(false);
      setEditingProduct(null);
      setFormData(DEFAULT_PRODUCT);

      await loadProducts();
    } catch (err) {
      console.error("Failed to save product:", err);

      setError(
        err?.message ||
          "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (product) => {
    const id = getProductId(product);

    if (!id) return;

    const currentStatus = getProductStatus(product);
    const nextStatus =
      currentStatus === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (
        typeof productService.updateProduct ===
        "function"
      ) {
        await productService.updateProduct(id, {
          ...product,
          status: nextStatus,
        });
      } else if (
        typeof settingService.updateProduct ===
        "function"
      ) {
        await settingService.updateProduct(id, {
          ...product,
          status: nextStatus,
        });
      } else {
        throw new Error(
          "Product update method is not available."
        );
      }

      setSuccess(
        `Product marked as ${nextStatus.toLowerCase()}.`
      );

      await loadProducts();
    } catch (err) {
      console.error(
        "Failed to update product status:",
        err
      );

      setError(
        err?.message ||
          "Unable to update product status."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSearchChange = (value) => {
    setSearch(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="product-settings-loading">
          <Loader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-settings-page">
        <div className="product-settings-header">
          <div>
            <h1>Product Settings</h1>
            <p>
              Manage solar products, pricing, specifications,
              and product availability.
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
          >
            Add Product
          </Button>
        </div>

        {error && (
          <div className="product-settings-alert product-settings-error">
            {error}
          </div>
        )}

        {success && (
          <div className="product-settings-alert product-settings-success">
            {success}
          </div>
        )}

        <div className="product-settings-summary">
          <div className="product-summary-card">
            <span>Total Products</span>
            <strong>{products.length}</strong>
          </div>

          <div className="product-summary-card">
            <span>Active Products</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="product-summary-card">
            <span>Inactive Products</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

        <div className="product-settings-filters">
          <div className="product-filter-search">
            <SearchBox
              value={search}
              onChange={handleSearchChange}
              placeholder="Search products..."
            />
          </div>

          <div className="product-filter-field">
            <label htmlFor="product-category">
              Category
            </label>

            <select
              id="product-category"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="ALL">All Categories</option>

              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="product-filter-field">
            <label htmlFor="product-status">
              Status
            </label>

            <select
              id="product-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">All Statuses</option>

              {STATUSES.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="product-settings-card">
          <div className="product-settings-card-header">
            <div>
              <h2>Product Catalog</h2>
              <span>
                {filteredProducts.length} product
                {filteredProducts.length === 1
                  ? ""
                  : "s"} found
              </span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="product-settings-empty">
              <div className="product-empty-icon">+</div>

              <h3>No Products Found</h3>

              <p>
                Add a product or change your current filters.
              </p>

              <Button
                type="button"
                onClick={openCreateModal}
              >
                Add Product
              </Button>
            </div>
          ) : (
            <div className="product-table-wrapper">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Capacity</th>
                    <th>Unit</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const id = getProductId(product);
                    const status =
                      getProductStatus(product);

                    return (
                      <tr key={id || getProductName(product)}>
                        <td>
                          <div className="product-name-cell">
                            <div className="product-icon">
                              {getProductName(product)
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getProductName(product)}
                              </strong>

                              {product?.description && (
                                <span>
                                  {product.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="product-code">
                            {getProductCode(product)}
                          </span>
                        </td>

                        <td>
                          {getProductCategory(product)}
                        </td>

                        <td>
                          {product?.capacity || "—"}
                        </td>

                        <td>
                          {product?.unit || "Piece"}
                        </td>

                        <td>
                          <strong>
                            {formatPrice(
                              getProductPrice(product)
                            )}
                          </strong>
                        </td>

                        <td>
                          <Badge
                            variant={
                              status === "ACTIVE"
                                ? "success"
                                : "default"
                            }
                          >
                            {status === "ACTIVE"
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </td>

                        <td>
                          <div className="product-actions">
                            <Button
                              type="button"
                              variant="secondary"
                              size="small"
                              onClick={() =>
                                openEditModal(product)
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              type="button"
                              variant="secondary"
                              size="small"
                              onClick={() =>
                                handleToggleStatus(product)
                              }
                              disabled={saving}
                            >
                              {status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalOpen && (
          <Modal
            isOpen={modalOpen}
            onClose={closeModal}
            title={
              editingProduct
                ? "Edit Product"
                : "Add Product"
            }
          >
            <form
              className="product-form"
              onSubmit={handleSubmit}
            >
              <div className="product-form-grid">
                <div className="product-form-field full-width">
                  <Input
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="product-form-field">
                  <Input
                    label="Product Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="Enter product code"
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-form-category">
                    Category
                  </label>

                  <select
                    id="product-form-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field">
                  <Input
                    label="Capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Example: 550W"
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-form-unit">
                    Unit
                  </label>

                  <select
                    id="product-form-unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    {UNITS.map((unit) => (
                      <option
                        key={unit}
                        value={unit}
                      >
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field">
                  <Input
                    label="Price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter product price"
                  />
                </div>

                <div className="product-form-field">
                  <label htmlFor="product-form-status">
                    Status
                  </label>

                  <select
                    id="product-form-status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status === "ACTIVE"
                          ? "Active"
                          : "Inactive"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="product-form-field full-width">
                  <label htmlFor="product-description">
                    Description
                  </label>

                  <textarea
                    id="product-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={4}
                  />
                </div>
              </div>

              <div className="product-form-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Create Product"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductSettingsPage;