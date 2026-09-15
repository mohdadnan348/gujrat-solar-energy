"use client";

import "./ConfigurationSummary.css";

const formatCurrency = (value) => {
  const amount = Number(value) || 0;

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const getName = (item, fallback = "Not selected") => {
  if (!item) return fallback;

  if (typeof item === "string") return item;

  return (
    item.name ||
    item.title ||
    item.model ||
    item.productName ||
    fallback
  );
};

const getValue = (item, keys, fallback = "—") => {
  if (!item || typeof item !== "object") {
    return fallback;
  }

  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null &&
      item[key] !== ""
    ) {
      return item[key];
    }
  }

  return fallback;
};

export default function ConfigurationSummary({
  configuration = {},
  panel,
  inverter,
  battery,
  structure,
  accessories = [],
  totalAmount,
  readOnly = true,
}) {
  const selectedPanel =
    panel ||
    configuration?.panel ||
    configuration?.panelDetails;

  const selectedInverter =
    inverter ||
    configuration?.inverter ||
    configuration?.inverterDetails;

  const selectedBattery =
    battery ||
    configuration?.battery ||
    configuration?.batteryDetails;

  const selectedStructure =
    structure ||
    configuration?.structure ||
    configuration?.structureDetails;

  const selectedAccessories =
    accessories.length > 0
      ? accessories
      : configuration?.accessories || [];

  const systemCapacity = getValue(
    configuration,
    [
      "systemCapacity",
      "capacity",
      "systemSize",
      "plantCapacity",
    ],
    getValue(selectedPanel, ["systemCapacity"], "—")
  );

  const panelQuantity = getValue(
    configuration,
    ["panelQuantity", "numberOfPanels", "quantity"],
    getValue(selectedPanel, ["quantity"], "—")
  );

  const inverterQuantity = getValue(
    configuration,
    ["inverterQuantity", "numberOfInverters"],
    getValue(selectedInverter, ["quantity"], "—")
  );

  const structureType = getValue(
    selectedStructure,
    ["type", "structureType", "name", "title"],
    "Not selected"
  );

  const calculatedTotal =
    totalAmount !== undefined &&
    totalAmount !== null
      ? Number(totalAmount) || 0
      : Number(
          configuration?.totalAmount ??
            configuration?.total ??
            configuration?.estimatedCost ??
            0
        ) || 0;

  const accessoryItems = selectedAccessories.filter(
    Boolean
  );

  return (
    <div className="configuration-summary">
      <div className="configuration-summary__header">
        <div>
          <h2 className="configuration-summary__title">
            Configuration Summary
          </h2>

          <p className="configuration-summary__subtitle">
            Review the selected solar system components.
          </p>
        </div>

        <span className="configuration-summary__status">
          {readOnly ? "Configured" : "Draft"}
        </span>
      </div>

      <div className="configuration-summary__grid">
        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            System Capacity
          </p>

          <p className="configuration-summary__value">
            {systemCapacity}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Panel Quantity
          </p>

          <p className="configuration-summary__value">
            {panelQuantity}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Inverter Quantity
          </p>

          <p className="configuration-summary__value">
            {inverterQuantity}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Panel
          </p>

          <p className="configuration-summary__value">
            {getName(selectedPanel)}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Inverter
          </p>

          <p className="configuration-summary__value">
            {getName(selectedInverter)}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Battery
          </p>

          <p className="configuration-summary__value">
            {getName(selectedBattery)}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Structure
          </p>

          <p className="configuration-summary__value">
            {structureType}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Battery Capacity
          </p>

          <p className="configuration-summary__value">
            {getValue(
              selectedBattery,
              [
                "capacity",
                "capacityAh",
                "batteryCapacity",
              ]
            )}
          </p>
        </div>

        <div className="configuration-summary__card">
          <p className="configuration-summary__label">
            Panel Wattage
          </p>

          <p className="configuration-summary__value">
            {getValue(
              selectedPanel,
              [
                "wattage",
                "power",
                "capacity",
              ]
            )}
          </p>
        </div>
      </div>

      <div className="configuration-summary__section">
        <h3 className="configuration-summary__section-title">
          Selected Accessories
        </h3>

        {accessoryItems.length === 0 ? (
          <div className="configuration-summary__empty">
            No accessories selected.
          </div>
        ) : (
          <div className="configuration-summary__items">
            {accessoryItems.map((accessory, index) => {
              const name = getName(
                accessory,
                `Accessory ${index + 1}`
              );

              const quantity = getValue(
                accessory,
                ["quantity", "qty"],
                1
              );

              const price = Number(
                getValue(
                  accessory,
                  ["price", "sellingPrice", "rate"],
                  0
                )
              );

              return (
                <div
                  className="configuration-summary__item"
                  key={
                    accessory?._id ||
                    accessory?.id ||
                    `${name}-${index}`
                  }
                >
                  <span className="configuration-summary__item-name">
                    {name}
                  </span>

                  <span className="configuration-summary__item-value">
                    {quantity} × ₹
                    {formatCurrency(price)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="configuration-summary__section">
        <h3 className="configuration-summary__section-title">
          Component Details
        </h3>

        <div className="configuration-summary__items">
          <div className="configuration-summary__item">
            <span className="configuration-summary__item-name">
              Panel Brand
            </span>

            <span className="configuration-summary__item-value">
              {getValue(
                selectedPanel,
                ["brand", "manufacturer"],
                "—"
              )}
            </span>
          </div>

          <div className="configuration-summary__item">
            <span className="configuration-summary__item-name">
              Inverter Capacity
            </span>

            <span className="configuration-summary__item-value">
              {getValue(
                selectedInverter,
                [
                  "capacity",
                  "capacityKw",
                  "power",
                ],
                "—"
              )}
            </span>
          </div>

          <div className="configuration-summary__item">
            <span className="configuration-summary__item-name">
              Battery Technology
            </span>

            <span className="configuration-summary__item-value">
              {getValue(
                selectedBattery,
                [
                  "technology",
                  "batteryType",
                  "type",
                ],
                "—"
              )}
            </span>
          </div>

          <div className="configuration-summary__item">
            <span className="configuration-summary__item-name">
              Structure Material
            </span>

            <span className="configuration-summary__item-value">
              {getValue(
                selectedStructure,
                [
                  "material",
                  "structureMaterial",
                ],
                "—"
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="configuration-summary__total">
        <span className="configuration-summary__total-label">
          Estimated Configuration Total
        </span>

        <span className="configuration-summary__total-value">
          ₹{formatCurrency(calculatedTotal)}
        </span>
      </div>
    </div>
  );
}