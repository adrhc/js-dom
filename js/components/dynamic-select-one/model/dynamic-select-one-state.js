class DynamicSelectOneState {
    /**
     * @param repository
     * @param minCharsToSearch {Number}
     * @param title {String}
     * @param selectedItem {DynaSelOneItem|undefined}
     * @param optionsPrefix {String}
     * @param options {DynaSelOneItem[]|undefined}
     */
    constructor(repository, minCharsToSearch, title,
                selectedItem, optionsPrefix, options) {
        this.repository = repository;
        this.minCharsToSearch = minCharsToSearch;
        this.title = title;
        this.selectedItem = selectedItem;
        this.cachePrefix = optionsPrefix;
        this.options = options;
    }

    /**
     * @param title
     * @returns {Promise<DynamicSelectOneState>}
     */
    setTitle(title) {
        console.log("title =", title);
        if (!title || title.length < this.minCharsToSearch || this.title === title) {
            return Promise.reject();
        }
        this.title = title;
        let optionsPromise;
        const newTitleContainsCurrentPrefix = this.cachePrefix != null && title.startsWith(this.cachePrefix);
        this.cachePrefix = title;
        if (newTitleContainsCurrentPrefix) {
            this.options = this.options.filter(o => o.title.startsWith(title));
            optionsPromise = Promise.resolve(this.options);
        } else {
            optionsPromise = this.repository.findByTitle(title);
        }
        return optionsPromise.then(options => {
            this.options = options;
            this.selectedItem = this._findOption();
            if (!!this.selectedItem) {
                this.title = this.selectedItem.title;
            }
            return this;
        });
    }

    _findOption() {
        return this.options.find(o => o.title === this.title);
    }

    setSelectItemId(id) {
        console.log("id =", id);
        this.selectedItem = this.options.find(o => o.id == id);
        if (!this.selectedItem) {
            console.error("Selected missing option! id =", id);
        }
        return this.setTitle(this.selectedItem.title);
    }

    get hasOptions() {
        return this.options && this.options.length;
    }
}