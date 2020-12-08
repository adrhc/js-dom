class TableEditorView {
    /**
     * @param readOnlyRow {ReadOnlyRow}
     * @param editableRow {EditableRow}
     * @param buttonsRow {ButtonsRow}
     * @param mustacheTableElemAdapter {MustacheTableElemAdapter}
     */
    constructor(readOnlyRow, editableRow, buttonsRow, mustacheTableElemAdapter) {
        this.readOnlyRow = readOnlyRow;
        this.editableRow = editableRow;
        this.buttonsRow = buttonsRow;
        this.mustacheTableElemAdapter = mustacheTableElemAdapter;
    }

    init(data) {
        this.mustacheTableElemAdapter.renderBody(data);
    }

    /**
     * @param editedId {string}
     * @return {*}
     */
    entityValuesFor(editedId) {
        const item = this.editableRow.valuesFor(editedId);
        EntityUtils.prototype.removeTransientId(item);
        return item;
    }

    /**
     * @param stateChanges {StateChange[]|undefined}
     */
    updateView(stateChanges) {
        if (!stateChanges) {
            // selection not changed, do nothing
            return;
        }
        stateChanges.forEach(sc => {
            if (sc.isSelected) {
                // row was created & selected or just selected
                // switch to "editable" row view
                this.editableRow.show(sc.item);
                this.buttonsRow.show(sc.item)
            } else {
                // row was deselected
                // remove the buttons row
                this.buttonsRow.hide();
                if (sc.isTransient) {
                    // remove transient row
                    this.readOnlyRow.hide(sc.item);
                } else {
                    // show as "read-only" the nontransient row
                    this.readOnlyRow.show(sc.item);
                }
            }
        })
    }

    /**
     * @param tr {HTMLTableRowElement}
     * @return {string}
     */
    rowDataIdOf(tr) {
        return $(tr).data("id");
    }
}