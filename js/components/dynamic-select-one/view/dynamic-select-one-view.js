class DynamicSelectOneView {
    constructor(elemId, tmplId, {placeholder, size = 10}) {
        this.elemId = elemId;
        this.tmplId = tmplId;
        this.placeholder = placeholder;
        this.size = size;
    }

    init(data) {
        this.updateView(data, true);
    }

    /**
     * @param data {DynamicSelectOneState}
     * @param focusOnSearchInput
     */
    updateView(data, focusOnSearchInput) {
        this._clearOnBlurHandlers();
        this._renderView(data)
        if (focusOnSearchInput) {
            this._focusOnSearchInput();
        }
    }

    /**
     * @param data {DynamicSelectOneState}
     */
    _renderView(data) {
        const viewData = this._viewDataOf(data);
        const html = Mustache.render(this.$tmplHtml, viewData);
        this.$componentElem.html(html.trim());
        if (viewData.renderOptions) {
            this.$selectElem.removeClass("removed");
            this.$descriptionElem.addClass("removed");
        } else {
            this.$selectElem.addClass("removed");
            this.$descriptionElem.removeClass("removed");
        }
    }

    _clearOnBlurHandlers() {
        this.$componentElem.off("blur.dyna-sel-one");
        const $searchInputElem = this.$searchInputElem;
        if ($searchInputElem.length) {
            $searchInputElem[0].onblur = null;
        }
    }

    _focusOnSearchInput() {
        const searchInput = this.$searchInputElem;
        const value = searchInput.val();
        searchInput.focus().val("").val(value);
    }

    /**
     * @param data {DynamicSelectOneState}
     */
    _viewDataOf(data) {
        const viewData = {
            title: data.title, placeholder: this.placeholder,
            size: Math.min(data.options ? data.options.length : 0, this.size),
            description: data.selectedItem ? data.selectedItem.description :
                "Nu s-a găsit nimic deocamdată!" + (data.title ? ` s-a cautat <i>${data.title}</i>` : "")
        };
        viewData.renderOptions = viewData.size > 1 || (viewData.size > 0 && !data.selectedItem);
        if (!viewData.renderOptions) {
            return viewData;
        }
        viewData.options = data.options.map(o => {
            const option = {id: o.id, description: o.description, selected: ""};
            if (data.selectedItem && o.id === data.selectedItem.id) {
                option.selected = "selected";
            }
            return option;
        });
        return viewData;
    }

    get $tmplHtml() {
        return $(`#${this.tmplId}`).html();
    }

    get $descriptionElem() {
        return $(`#${this.elemId} .dyna-sel-one-description`);
    }

    get $selectElem() {
        return $(`#${this.elemId} [name='options']`);
    }

    get $searchInputElem() {
        return $(`#${this.elemId} [name='title']`);
    }

    get $componentElem() {
        return $(`#${this.elemId}`);
    }
}