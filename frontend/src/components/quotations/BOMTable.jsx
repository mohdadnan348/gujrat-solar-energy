"use client";

export default function BOMTable({
  items = [],
  data,
  onChange,
  readOnly = false,
}) {
  const bomItems = Array.isArray(data) ? data : items;

  const updateItem = (index, field, value) => {
    if (readOnly || !onChange) return;

    const updatedItems = bomItems.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            [field]: value,
          }
        : item
    );

    onChange(updatedItems);
  };

  const removeItem = (index) => {
    if (readOnly || !onChange) return;

    const updatedItems = bomItems.filter(
      (_, itemIndex) => itemIndex !== index
    );

    onChange(updatedItems);
  };

  const calculateAmount = (item) => {
    const quantity = Number(item?.quantity) || 0;
    const rate = Number(item?.rate) || 0;

    return quantity * rate;
  };

  const totalAmount = bomItems.reduce(
    (total, item) => total + calculateAmount(item),
    0
  );

  return (
    <div className="bom-table">
      <div className="bom-table__header">
        <div>
          <h3 className="bom-table__title">
            Bill of Materials
          </h3>

          <p className="bom-table__subtitle">
            Solar system components and material requirements.
          </p>
        </div>

        <div className="bom-table__count">
          {bomItems.length} Items
        </div>
      </div>

      <div className="bom-table__wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Component</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Amount</th>
              {!readOnly && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {bomItems.length === 0 ? (
              <tr>
                <td
                  colSpan={readOnly ? 7 : 8}
                  className="bom-table__empty"
                >
                  No materials added.
                </td>
              </tr>
            ) : (
              bomItems.map((item, index) => (
                <tr
                  key={
                    item?._id ||
                    item?.id ||
                    `bom-item-${index}`
                  }
                >
                  <td className="bom-table__number">
                    {String(index + 1).padStart(2, "0")}
                  </td>

                  <td>
                    {readOnly ? (
                      <span className="bom-table__text">
                        {item?.component ||
                          item?.name ||
                          "—"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={
                          item?.component ||
                          item?.name ||
                          ""
                        }
                        onChange={(event) =>
                          updateItem(
                            index,
                            "component",
                            event.target.value
                          )
                        }
                        placeholder="Component name"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span className="bom-table__text">
                        {item?.description || "—"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={
                          item?.description || ""
                        }
                        onChange={(event) =>
                          updateItem(
                            index,
                            "description",
                            event.target.value
                          )
                        }
                        placeholder="Description"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span className="bom-table__quantity">
                        {item?.quantity ?? 0}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={item?.quantity ?? ""}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "quantity",
                            event.target.value
                          )
                        }
                        placeholder="0"
                      />
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span className="bom-table__unit">
                        {item?.unit || "Nos"}
                      </span>
                    ) : (
                      <select
                        value={item?.unit || "Nos"}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "unit",
                            event.target.value
                          )
                        }
                      >
                        <option value="Nos">
                          Nos
                        </option>
                        <option value="Set">
                          Set
                        </option>
                        <option value="Meter">
                          Meter
                        </option>
                        <option value="Kg">
                          Kg
                        </option>
                        <option value="Lot">
                          Lot
                        </option>
                      </select>
                    )}
                  </td>

                  <td>
                    {readOnly ? (
                      <span className="bom-table__rate">
                        ₹
                        {(
                          Number(item?.rate) || 0
                        ).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        value={item?.rate ?? ""}
                        onChange={(event) =>
                          updateItem(
                            index,
                            "rate",
                            event.target.value
                          )
                        }
                        placeholder="0.00"
                      />
                    )}
                  </td>

                  <td>
                    <span className="bom-table__amount">
                      ₹
                      {calculateAmount(
                        item
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>

                  {!readOnly && (
                    <td>
                      <button
                        type="button"
                        className="bom-table__remove"
                        onClick={() =>
                          removeItem(index)
                        }
                        aria-label={`Remove ${
                          item?.component ||
                          item?.name ||
                          "item"
                        }`}
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>

          {bomItems.length > 0 && (
            <tfoot>
              <tr>
                <td
                  colSpan={readOnly ? 6 : 6}
                  className="bom-table__total-label"
                >
                  Total Material Amount
                </td>

                <td className="bom-table__total">
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </td>

                {!readOnly && <td />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}