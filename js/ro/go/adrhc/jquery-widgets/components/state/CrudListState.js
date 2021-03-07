/**
 * @extends {SimpleListState<IdentifiableEntity[], EntityRow<IdentifiableEntity>>}
 */
class CrudListState extends SimpleListState {
    /**
     * @type {function(): IdentifiableEntity}
     */
    newEntityFactoryFn;
    /**
     * whether to append or prepend new items
     *
     * @type {boolean}
     */
    append;

    /**
     * @param {IdentifiableEntity[]} [initialState]
     * @param {function(): IdentifiableEntity} [newEntityFactoryFn]
     * @param {boolean} [newItemsGoToTheEndOfTheList]
     * @param {TaggingStateChangeMapper<IdentifiableEntity[]>} [stateChangeMapper]
     * @param {StateChangesCollector<IdentifiableEntity[]>} [changeManager]
     */
    constructor({
                    initialState,
                    newEntityFactoryFn = () => new IdentifiableEntity(IdentifiableEntity.TRANSIENT_ID),
                    newItemsGoToTheEndOfTheList,
                    stateChangeMapper,
                    changeManager
                }) {
        super({initialState, stateChangeMapper, changeManager});
        this.newEntityFactoryFn = newEntityFactoryFn;
        this.append = newItemsGoToTheEndOfTheList;
    }

    /**
     * @param {number} index
     * @return {EntityRow<IdentifiableEntity>|undefined}
     */
    getStatePart(index) {
        if (this.items == null || index >= this.items.length) {
            return undefined;
        }
        return new EntityRow(this.items[index], index);
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} newRowValues
     * @param {number} oldIndex
     * @return {boolean}
     * @protected
     */
    _currentStatePartEquals(newRowValues, oldIndex) {
        return newRowValues == null && this.items.length <= oldIndex ||
            newRowValues != null && this.items.length > oldIndex &&
            this.items.length > newRowValues.index &&
            this.items[oldIndex] === newRowValues.entity &&
            newRowValues.index === oldIndex;
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} newRowValues
     * @param {number} oldIndex
     * @return {EntityRow<IdentifiableEntity>} previous state part
     * @protected
     */
    _replacePartImpl(newRowValues, oldIndex) {
        const oldRowValues = this.getStatePart(oldIndex);
        if (oldRowValues == null) {
            if (newRowValues == null) {
                // both old and new item are null, nothing else to do
                return oldRowValues;
            }
            // old item doesn't exists, inserting the new one
            ArrayUtils.insert(newRowValues.entity, newRowValues.index, this.items);
        } else if (newRowValues == null) {
            // old item exists but the new one is null (i.e. old is deleted)
            ArrayUtils.removeByIndex(oldIndex, this.items);
        } else if (newRowValues.index === oldIndex) {
            // the index is the same, only changing the value at that index
            this.items[oldIndex] = newRowValues.entity;
        } else {
            // both item's value and index changed
            ArrayUtils.removeByIndex(oldIndex, this.items);
            ArrayUtils.insert(newRowValues.entity, newRowValues.index, this.items);
        }
        return oldRowValues;
    }

    /**
     * must return the original item (the one stored in this.items) for the receiver to be able to change its id
     * risk: the item is also used with the collectStateChange; a change by the final receiver will impact this.items!
     *
     * @param {IdentifiableEntity|{}} [initialValue]
     * @param {boolean} [append]
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    createNewItem(initialValue, append = this.append) {
        const item = this.newEntityFactoryFn();
        if (initialValue != null) {
            $.extend(item, initialValue);
        }
        return this.insertItem(item, append);
    }

    /**
     * @param item {IdentifiableEntity} is to insert if itemIdToRemove exists otherwise update
     * @param itemIdToRemove {number|string} is to remove if exists
     * @param append {boolean|undefined}
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    save(item, itemIdToRemove, append = this.append) {
        if (itemIdToRemove != null && !EntityUtils.idsAreEqual(item.id, itemIdToRemove)) {
            this.removeById(itemIdToRemove);
            return this.insertItem(item, append);
        } else {
            return this.updateItem(item);
        }
    }

    /**
     * @param {IdentifiableEntity} item
     * @param {boolean} [append]
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    insertItem(item, append = this.append) {
        const newItemIndex = append ? this.items.length : 0;
        return this._replaceItem(new EntityRow(item, newItemIndex));
    }

    /**
     * @param {IdentifiableEntity} item
     * @param {number} [newItemIndex]
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    updateItem(item, newItemIndex) {
        const oldIndex = this.findIndexById(item.id);
        return this._replaceItem(new EntityRow(item,
            newItemIndex == null ? oldIndex : newItemIndex), oldIndex);
    }

    /**
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    removeTransient() {
        return this.removeById(IdentifiableEntity.TRANSIENT_ID);
    }

    /**
     * @param {number|string} id
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     */
    removeById(id) {
        const indexToRemove = this.findIndexById(id);
        return this._removeItem(indexToRemove);
    }

    /**
     * @param {number} index
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     * @protected
     */
    _removeItem(index) {
        return this.replacePart(undefined, index);
    }

    /**
     * @param {EntityRow<IdentifiableEntity>} rowValues
     * @param {number} [oldIndex]
     * @return {TaggedStateChange<EntityRow<IdentifiableEntity>>}
     * @protected
     */
    _replaceItem(rowValues, oldIndex = rowValues == null ? undefined : rowValues.index) {
        return this.replacePart(rowValues, oldIndex);
    }

    /**
     * @param {number|string} id
     * @return {number}
     */
    findIndexById(id) {
        return EntityUtils.findIndexById(id, this.items);
    }
}