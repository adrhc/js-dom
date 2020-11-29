/**
 * Role: capture all table events
 */
class TabularComponent {
    constructor(tableId, bodyTmpl, readOnlyRowTmpl, editableRowTmpl) {
        this.state = new TabularState();
        this.table = new HtmlTableAdapter(tableId, bodyTmpl);
        this.readOnlyRowTmpl = readOnlyRowTmpl;
        this.editableRowTmpl = editableRowTmpl;
        this.readOnlyRow = new TabularRow(this.state, this.table, this.readOnlyRowTmpl);
        this.editableRow = new TabularEditableRow(this.state, this.table, this.editableRowTmpl);
        this.formUtils = new FormsHelper("editorForm");
        this.repo = new PersonsRepository();
        this.configureTableEvents();
    }

    /**
     * header selection event handler
     */
    onHeadSelection(ev) {
        const tabularEditor = ev.data;
        if (tabularEditor.state.notPersistentSelectionExists()) {
            return false;
        }
        tabularEditor.createItem();
    }

    /**
     * row selection event handler
     */
    onItemSelection(ev) {
        const tabularEditor = ev.data;
        const selectedIndex = this.rowIndex - 1;
        if (tabularEditor.state.isIndexSelected(selectedIndex)) {
            // index already selected, nothing else to do here
            return false;
        }
        tabularEditor.switchSelectionTo(selectedIndex);
    }

    /**
     * save event handler
     */
    onSave(ev) {
        const tabularEditor = ev.data;
        const person = tabularEditor.formUtils.objectifyForm();
        tabularEditor.repo.save(person)
            .then((savedPerson) => {
                console.log(savedPerson);
                tabularEditor.state.replaceItem(savedPerson);
                tabularEditor.cancelEdit();
            })
            .catch((jqXHR, textStatus, errorThrown) => {
                console.log(textStatus, errorThrown);
                alert(textStatus);
            });
    }

    /**
     * cancel event handler
     */
    onCancel(ev) {
        ev.data.cancelEdit();
    }

    /**
     * initializer
     */
    show() {
        this.repo.get().then((persons) => {
            console.log("persons:\n", persons);
            this.state.items = persons;
            this.table.renderBody({persons: persons});
        });
    }

    /**
     * private method
     */
    createItem() {
        if (this.state.selectionExists()) {
            this.cancelEdit();
        }
        this.state.createAndSelectEmptyItem(0);
        this.editableRow.show(true);
    }

    /**
     * private method
     */
    switchSelectionTo(selectedIndex) {
        const currentlySelectedIndex = this.state.selectedIndex;
        const prevSelItemWasRemoved = this.state.selectionExists() && this.cancelEdit();
        const prevSelItemPositionIsBeforeNewSelection = currentlySelectedIndex < selectedIndex;
        const removedRowsPositionedBeforeNewSelectedOneExist =
            prevSelItemWasRemoved && prevSelItemPositionIsBeforeNewSelection ? 1 : 0;
        this.state.selectedIndex = selectedIndex - removedRowsPositionedBeforeNewSelectedOneExist;
        this.editableRow.show();
    }

    /**
     * private method
     *
     * @returns true when a row was removed from table but not replaced
     */
    cancelEdit() {
        const selectionIsPersistent = this.state.selectionIsPersistent();
        if (selectionIsPersistent) {
            this.readOnlyRow.show();
            this.state.cancelSelection();
        } else {
            this.readOnlyRow.hide();
            this.state.removeSelectedItem();
        }
        return !selectionIsPersistent;
    }

    /**
     * private method
     */
    configureTableEvents() {
        this.table.thead().on('dblclick', 'tr', this, this.onHeadSelection);
        this.table.tbody().on('dblclick', 'tr', this, this.onItemSelection);
        this.table.tbody().on('click', '#cancel', this, this.onCancel);
        this.table.tbody().on('click', '#save', this, this.onSave);
    }
}