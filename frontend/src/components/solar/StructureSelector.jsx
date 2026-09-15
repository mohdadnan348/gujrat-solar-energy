"use client";

import "./StructureSelector.css";

export default function StructureSelector({
  structures = [],
  selectedStructure = null,
  onChange,
  readOnly = false,
}) {
  const selectedId =
    typeof selectedStructure === "object"
      ? selectedStructure?._id || selectedStructure?.id
      : selectedStructure;

  const handleSelect = (structure) => {
    if (readOnly || !onChange) return;

    const id = structure?._id || structure?.id;

    if (!id) return;

    onChange(structure);
  };

  const getValue = (
    structure,
    keys,
    fallback = "—"
  ) => {
    if (!structure || typeof structure !== "object") {
      return fallback;
    }

    for (const key of keys) {
      if (
        structure[key] !== undefined &&
        structure[key] !== null &&
        structure[key] !== ""
      ) {
        return structure[key];
      }
    }

    return fallback;
  };

  const formatPrice = (structure) => {
    const price =
      Number(
        getValue(
          structure,
          ["price", "sellingPrice", "rate"],
          0
        )
      ) || 0;

    return price.toLocaleString("en-IN");
  };

  return (
    <div className="structure-selector">
      <div className="structure-selector__header">
        <div>
          <h3 className="structure-selector__title">
            Mounting Structure
          </h3>

          <p className="structure-selector__subtitle">
            Select the mounting structure required for the solar system.
          </p>
        </div>

        <span className="structure-selector__count">
          {structures.length}
        </span>
      </div>

      {structures.length === 0 ? (
        <div className="structure-selector__empty">
          No mounting structures available.
        </div>
      ) : (
        <div className="structure-selector__list">
          {structures.map((structure, index) => {
            const id =
              structure?._id ||
              structure?.id ||
              `structure-${index}`;

            const name = getValue(
              structure,
              [
                "name",
                "structureName",
                "title",
                "model",
              ],
              "Mounting Structure"
            );

            const description = getValue(
              structure,
              ["description", "details"],
              "Solar panel mounting structure."
            );

            const material = getValue(
              structure,
              [
                "material",
                "structureMaterial",
              ]
            );

            const type = getValue(
              structure,
              [
                "type",
                "structureType",
              ]
            );

            const capacity = getValue(
              structure,
              [
                "capacity",
                "panelCapacity",
                "supportedPanels",
              ]
            );

            const price = formatPrice(structure);

            const selected = selectedId === id;

            return (
              <label
                key={id}
                className={`structure-selector__item ${
                  selected
                    ? "structure-selector__item--selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="solar-structure"
                  className="structure-selector__radio"
                  checked={selected}
                  disabled={readOnly}
                  onChange={() =>
                    handleSelect(structure)
                  }
                />

                <div className="structure-selector__content">
                  <h4 className="structure-selector__name">
                    {name}
                  </h4>

                  <p className="structure-selector__description">
                    {description}
                  </p>

                  <div className="structure-selector__specs">
                    <span className="structure-selector__spec">
                      Material: {material}
                    </span>

                    <span className="structure-selector__spec">
                      Type: {type}
                    </span>

                    <span className="structure-selector__spec">
                      Capacity: {capacity}
                    </span>
                  </div>

                  <div className="structure-selector__price">
                    ₹{price}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {selectedStructure && (
        <div className="structure-selector__footer">
          <div className="structure-selector__selected">
            Selected:
            <strong>
              {typeof selectedStructure === "object"
                ? getValue(
                    selectedStructure,
                    [
                      "name",
                      "structureName",
                      "title",
                      "model",
                    ],
                    "Mounting Structure"
                  )
                : "Mounting Structure"}
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}