"use client";

import "./PanelSelector.css";

export default function PanelSelector({
  panels = [],
  selectedPanel = null,
  onChange,
  readOnly = false,
}) {
  const selectedId =
    typeof selectedPanel === "object"
      ? selectedPanel?._id || selectedPanel?.id
      : selectedPanel;

  const handleSelect = (panel) => {
    if (readOnly || !onChange) return;

    const id = panel?._id || panel?.id;

    if (!id) return;

    onChange(panel);
  };

  const getValue = (
    panel,
    keys,
    fallback = "—"
  ) => {
    if (!panel || typeof panel !== "object") {
      return fallback;
    }

    for (const key of keys) {
      if (
        panel[key] !== undefined &&
        panel[key] !== null &&
        panel[key] !== ""
      ) {
        return panel[key];
      }
    }

    return fallback;
  };

  const formatPrice = (panel) => {
    const price =
      Number(
        getValue(
          panel,
          ["price", "sellingPrice", "rate"],
          0
        )
      ) || 0;

    return price.toLocaleString("en-IN");
  };

  return (
    <div className="panel-selector">
      <div className="panel-selector__header">
        <div>
          <h3 className="panel-selector__title">
            Solar Panel
          </h3>

          <p className="panel-selector__subtitle">
            Select the solar panel required for the system.
          </p>
        </div>

        <span className="panel-selector__count">
          {panels.length}
        </span>
      </div>

      {panels.length === 0 ? (
        <div className="panel-selector__empty">
          No solar panels available.
        </div>
      ) : (
        <div className="panel-selector__list">
          {panels.map((panel, index) => {
            const id =
              panel?._id ||
              panel?.id ||
              `panel-${index}`;

            const name = getValue(
              panel,
              [
                "name",
                "panelName",
                "title",
                "model",
              ],
              "Solar Panel"
            );

            const description = getValue(
              panel,
              ["description", "details"],
              "High-efficiency solar panel."
            );

            const wattage = getValue(
              panel,
              [
                "wattage",
                "power",
                "capacity",
                "watt",
              ]
            );

            const technology = getValue(
              panel,
              [
                "technology",
                "panelType",
                "type",
              ]
            );

            const brand = getValue(
              panel,
              ["brand", "manufacturer"],
              "—"
            );

            const price = formatPrice(panel);

            const selected = selectedId === id;

            return (
              <label
                key={id}
                className={`panel-selector__item ${
                  selected
                    ? "panel-selector__item--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="solar-panel"
                  className="panel-selector__radio"
                  checked={selected}
                  disabled={readOnly}
                  onChange={() =>
                    handleSelect(panel)
                  }
                />

                <div className="panel-selector__content">
                  <h4 className="panel-selector__name">
                    {name}
                  </h4>

                  <p className="panel-selector__description">
                    {description}
                  </p>

                  <div className="panel-selector__specs">
                    <span className="panel-selector__spec">
                      Power: {wattage}
                    </span>

                    <span className="panel-selector__spec">
                      Technology: {technology}
                    </span>

                    <span className="panel-selector__spec">
                      Brand: {brand}
                    </span>
                  </div>

                  <div className="panel-selector__price">
                    ₹{price}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedPanel && (
        <div className="panel-selector__footer">
          <div className="panel-selector__selected">
            Selected:
            <strong>
              {typeof selectedPanel === "object"
                ? getValue(
                    selectedPanel,
                    [
                      "name",
                      "panelName",
                      "title",
                      "model",
                    ],
                    "Solar Panel"
                  )
                : "Solar Panel"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}