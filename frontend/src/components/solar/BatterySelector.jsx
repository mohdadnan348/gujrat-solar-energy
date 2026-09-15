"use client";

import "./BatterySelector.css";

export default function BatterySelector({
  batteries = [],
  selectedBattery = null,
  onChange,
  readOnly = false,
}) {
  const selectedId =
    typeof selectedBattery === "object"
      ? selectedBattery?._id || selectedBattery?.id
      : selectedBattery;

  const handleSelect = (battery) => {
    if (readOnly || !onChange) return;

    const id = battery?._id || battery?.id;

    if (!id) return;

    onChange(battery);
  };

  const getValue = (battery, keys, fallback = "") => {
    for (const key of keys) {
      if (
        battery?.[key] !== undefined &&
        battery?.[key] !== null &&
        battery?.[key] !== ""
      ) {
        return battery[key];
      }
    }

    return fallback;
  };

  const formatPrice = (battery) => {
    const price = Number(
      getValue(
        battery,
        ["price", "sellingPrice", "rate"],
        0
      )
    );

    return price.toLocaleString("en-IN");
  };

  return (
    <div className="battery-selector">
      <div className="battery-selector__header">
        <div>
          <h3 className="battery-selector__title">
            Battery
          </h3>

          <p className="battery-selector__subtitle">
            Select the battery required for the solar system.
          </p>
        </div>

        <span className="battery-selector__count">
          {batteries.length}
        </span>
      </div>

      {batteries.length === 0 ? (
        <div className="battery-selector__empty">
          No batteries available.
        </div>
      ) : (
        <div className="battery-selector__list">
          {batteries.map((battery, index) => {
            const id =
              battery?._id ||
              battery?.id ||
              `battery-${index}`;

            const name = getValue(
              battery,
              ["name", "batteryName", "title", "model"],
              "Battery"
            );

            const description = getValue(
              battery,
              ["description", "details"],
              "Solar battery storage solution."
            );

            const capacity = getValue(
              battery,
              [
                "capacity",
                "capacityAh",
                "batteryCapacity",
              ],
              "—"
            );

            const voltage = getValue(
              battery,
              ["voltage", "voltageV"],
              "—"
            );

            const technology = getValue(
              battery,
              ["technology", "batteryType", "type"],
              "—"
            );

            const price = formatPrice(battery);

            const selected = selectedId === id;

            return (
              <label
                key={id}
                className={`battery-selector__item ${
                  selected
                    ? "battery-selector__item--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="solar-battery"
                  className="battery-selector__radio"
                  checked={selected}
                  disabled={readOnly}
                  onChange={() =>
                    handleSelect(battery)
                  }
                />

                <div className="battery-selector__content">
                  <h4 className="battery-selector__name">
                    {name}
                  </h4>

                  <p className="battery-selector__description">
                    {description}
                  </p>

                  <div className="battery-selector__specs">
                    <span className="battery-selector__spec">
                      Capacity: {capacity}
                    </span>

                    <span className="battery-selector__spec">
                      Voltage: {voltage}
                    </span>

                    <span className="battery-selector__spec">
                      Technology: {technology}
                    </span>
                  </div>

                  <div className="battery-selector__price">
                    ₹{price}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedBattery && (
        <div className="battery-selector__footer">
          <div className="battery-selector__selected">
            Selected:
            <strong>
              {typeof selectedBattery === "object"
                ? getValue(
                    selectedBattery,
                    [
                      "name",
                      "batteryName",
                      "title",
                      "model",
                    ],
                    "Battery"
                  )
                : "Battery"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}