"use client";

import "./InverterSelector.css";

export default function InverterSelector({
  inverters = [],
  selectedInverter = null,
  onChange,
  readOnly = false,
}) {
  const selectedId =
    typeof selectedInverter === "object"
      ? selectedInverter?._id || selectedInverter?.id
      : selectedInverter;

  const handleSelect = (inverter) => {
    if (readOnly || !onChange) return;

    const id = inverter?._id || inverter?.id;

    if (!id) return;

    onChange(inverter);
  };

  const getValue = (
    inverter,
    keys,
    fallback = "—"
  ) => {
    if (!inverter || typeof inverter !== "object") {
      return fallback;
    }

    for (const key of keys) {
      if (
        inverter[key] !== undefined &&
        inverter[key] !== null &&
        inverter[key] !== ""
      ) {
        return inverter[key];
      }
    }

    return fallback;
  };

  const formatPrice = (inverter) => {
    const price =
      Number(
        getValue(
          inverter,
          ["price", "sellingPrice", "rate"],
          0
        )
      ) || 0;

    return price.toLocaleString("en-IN");
  };

  return (
    <div className="inverter-selector">
      <div className="inverter-selector__header">
        <div>
          <h3 className="inverter-selector__title">
            Inverter
          </h3>

          <p className="inverter-selector__subtitle">
            Select the inverter required for the solar system.
          </p>
        </div>

        <span className="inverter-selector__count">
          {inverters.length}
        </span>
      </div>

      {inverters.length === 0 ? (
        <div className="inverter-selector__empty">
          No inverters available.
        </div>
      ) : (
        <div className="inverter-selector__list">
          {inverters.map((inverter, index) => {
            const id =
              inverter?._id ||
              inverter?.id ||
              `inverter-${index}`;

            const name = getValue(
              inverter,
              [
                "name",
                "inverterName",
                "title",
                "model",
              ],
              "Inverter"
            );

            const description = getValue(
              inverter,
              ["description", "details"],
              "Solar power conversion solution."
            );

            const capacity = getValue(
              inverter,
              [
                "capacity",
                "capacityKw",
                "power",
                "inverterCapacity",
              ]
            );

            const phase = getValue(
              inverter,
              ["phase", "phaseType"],
              "—"
            );

            const technology = getValue(
              inverter,
              ["technology", "type", "inverterType"],
              "—"
            );

            const price = formatPrice(inverter);

            const selected = selectedId === id;

            return (
              <label
                key={id}
                className={`inverter-selector__item ${
                  selected
                    ? "inverter-selector__item--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="solar-inverter"
                  className="inverter-selector__radio"
                  checked={selected}
                  disabled={readOnly}
                  onChange={() =>
                    handleSelect(inverter)
                  }
                />

                <div className="inverter-selector__content">
                  <h4 className="inverter-selector__name">
                    {name}
                  </h4>

                  <p className="inverter-selector__description">
                    {description}
                  </p>

                  <div className="inverter-selector__specs">
                    <span className="inverter-selector__spec">
                      Capacity: {capacity}
                    </span>

                    <span className="inverter-selector__spec">
                      Phase: {phase}
                    </span>

                    <span className="inverter-selector__spec">
                      Technology: {technology}
                    </span>
                  </div>

                  <div className="inverter-selector__price">
                    ₹{price}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedInverter && (
        <div className="inverter-selector__footer">
          <div className="inverter-selector__selected">
            Selected:
            <strong>
              {typeof selectedInverter === "object"
                ? getValue(
                    selectedInverter,
                    [
                      "name",
                      "inverterName",
                      "title",
                      "model",
                    ],
                    "Inverter"
                  )
                : "Inverter"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}