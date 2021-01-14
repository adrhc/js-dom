if (Modernizr.template) {
    $.ajaxSetup({
        contentType: 'application/json',
        processData: false
    });
    $.ajaxPrefilter(function (options) {
        if (options.contentType === 'application/json' && options.data) {
            options.data = JSON.stringify(options.data);
        }
    });

    $(() => {
        const personsRepository = DbMock.PERSONS_REPOSITORY;

        const items = [{id: 1, name: "dog1", person: DbMock.PERSONS_REPOSITORY[0]}, {id: 2, name: "dog2"}, {id: 3, name: "dog3"}];
        const addNewRowsAtEnd = true;

        // see interface ChildComponentFactory
        const rowChildCompFactories = {
            /**
             * @param idRowCompParent {IdentifiableRowComponent}
             * @return {DynamicSelectOneComponent}
             */
            createChildComponent: (idRowCompParent) => {
                AssertionUtils.assertNotNull(idRowCompParent.view.$elem, "rowChildCompFactories, DynamicSelectOneFactory");

                return DynamicSelectOneFactory.create($("[data-id='dyna-sel-one']", idRowCompParent.view.$elem), personsRepository, {
                    childishBehaviour: new DynaSelOneChildishBehaviour(idRowCompParent, "person", () => new Person())
                })
            }
        };

        // dogs table with read-only row (default: on creation prepend to table)
        const elasticList = ElasticListFactory.create("dogsTable", "dogsTableRowTmpl", {
            items, addNewRowsAtEnd, rowChildCompFactories
        });

        elasticList
            .init()
            .then(() => elasticList.doWithState((crudListState) => {
                crudListState.createNewItem().name = "new dog";
                crudListState.updateItem({id: 3, name: "updated dog3"});
                crudListState.removeById(2);
                crudListState.insertItem({
                    id: 2,
                    name: `restored dog2 with ${addNewRowsAtEnd ? "append" : "preppend"}`
                });
            }))
            .then(() => console.log("ElasticListComponent.extractAllEntities:\n",
                elasticList.extractAllEntities()));
    });
} else {
    // Find another way to add the rows to the table because
    // the HTML template element is not supported.
}