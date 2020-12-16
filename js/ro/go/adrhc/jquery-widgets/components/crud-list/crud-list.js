class CrudListComponent extends SelectableElasticListComponent {
    /**
     * @param mustacheTableElemAdapter {MustacheTableElemAdapter}
     * @param repository {CrudRepository}
     * @param state {SelectableElasticListState}
     * @param view {SimpleListView}
     * @param readOnlyRow {IdentifiableRow}
     * @param editableRow {IdentifiableRow}
     * @param deletableRow {IdentifiableRow}
     */
    constructor(mustacheTableElemAdapter,
                repository, state, view,
                readOnlyRow, editableRow, deletableRow) {
        super(mustacheTableElemAdapter, repository, state, view, readOnlyRow, editableRow);
        this._onOffContextAwareRowSelector = {
            "SHOW_DELETE": deletableRow
        }
    }

    /**
     * (existing) item selection event handler
     *
     * @param ev {Event}
     */
    switchToDelete(ev) {
        const selectableList = ev.data;
        const rowDataId = selectableList.view.rowDataIdOf(this, true);
        if (!rowDataId) {
            return;
        }
        ev.stopPropagation();
        selectableList._switchToId(rowDataId, "SHOW_DELETE");
    }

    /**
     * @param stateChange
     * @return {Promise<StateChange>}
     * @protected
     */
    _updateOnSelect(stateChange) {
        const onOff = stateChange.state;
        const selectableOnOffData = onOff.data;
        if (!onOff.isOff && selectableOnOffData.context) {
            return this._onOffContextAwareRowSelector[selectableOnOffData.context].update(selectableOnOffData.item);
        } else {
            return super._updateOnSelect(stateChange);
        }
    }

    /**
     * linking "outside" (and/or default) triggers to component's handlers (aka capabilities)
     * @private
     */
    _configureEvents() {
        super._configureEvents();
        this.mustacheTableElemAdapter.$table
            .on(this.withNamespaceFor('click'),
                `${this.ownerSelector}[data-btn='delete']`, this, this.switchToDelete);
    }
}