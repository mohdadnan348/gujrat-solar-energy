"use client";

import "./AccessorySelector.css";

export default function AccessorySelector({
  accessories = [],
  selectedAccessories = [],
  onChange,
  readOnly = false,
}) {
  const selectedIds = selectedAccessories.map((item) =>
    typeof item === "object"
      ? item._id || item.id
      : item
  );

  const isSelected = (accessory) => {
    const id = accessory?._id || accessory?.id;
    return selectedIds.includes(id);
  };

  const handleToggle = (accessory) => {
    if (readOnly || !onChange) return;

    const id = accessory?._id || accessory?.id;

    if (!id) return;

    const exists = isSelected(accessory);

    if (exists) {
      onChange(
        selectedAccessories.filter((item) => {
          const itemId =
            typeof item === "object"
              ? item._id || item.id
              : item;

          return itemId !== id;
        })
      );

      return;
    }

    onChange([
      ...selectedAccessories,
      accessory,
    ]);
  };

  const getPrice = (accessory) => {
    return (
      Number(
        accessory?.price ??
          accessory?.sellingPrice ??
          accessory?.rate ??
          0
      ) || 0
    );
  };

  const totalAmount = selectedAccessories.reduce(
    (total, item) => {
      const accessory =
        typeof item === "object" ? item : null;

      return total + getPrice(accessory);
    },
    0
  );

  return (
    <div className="accessory-selector">
      <div className="accessory-selector__header">
        <div>
          <h3 className="accessory-selector__title">
            Accessories
          </h3>

          <p className="accessory-selector__subtitle">
            Select additional accessories for the solar system.
          </p>
        </div>

        <span className="accessory-selector__count">
          {selectedAccessories.length}
        </span>
      </div>

      {accessories.length === 0 ? (
        <div className="accessory-selector__empty">
          No accessories available.
        </div>
      ) : (
        <div className="accessory-selector__list">
          {accessories.map((accessory, index) => {
            const id =
              accessory?._id ||
              accessory?.id ||
              `accessory-${index}`;

            const selected =
              isSelected(accessory);

            const name =
              accessory?.name ||
              accessory?.accessoryName ||
              accessory?.title ||
              "Accessory";

            const description =
              accessory?.description ||
              accessory?.details ||
              "Additional solar system accessory.";

            const price = getPrice(accessory);

            const quantity =
              accessory?.quantity ??
              accessory?.unit ??
              "1";

            return (
              <label
                key={id}
                className={`accessory-selector__item ${
                  selected
                    ? "accessory-selector__item--selected"
                    : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="accessory-selector__checkbox"
                  checked={selected}
                  disabled={readOnly}
                  onChange={() =>
                    handleToggle(accessory)
                  }
                />

                <div className="accessory-selector__content">
                  <h4 className="accessory-selector__name">
                    {name}
                  </h4>

                  <p className="accessory-selector__description">
                    {description}
                  </p>

                  <div className="accessory-selector__meta">
                    <span className="accessory-selector__price">
                      ₹
                      {price.toLocaleString("en-IN")}
                    </span>

                    <span className="accessory-selector__quantity">
                      Unit: {quantity}
                    </span>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedAccessories.length > 0 && (
        <div className="accessory-selector__footer">
          <div className="accessory-selector__total">
            Selected Total:
            <strong>
              ₹
              {totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}