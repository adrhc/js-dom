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
        // dogs table with both read-only and editable row
        const tableIdOrJQuery = "dogsTable";
        const tableRelativePositionOnCreate = "append";

        const notSelectedRow = SimpleRowFactory.createIdentifiableRow(
            {
                tableIdOrJQuery, tableRelativePositionOnCreate
            });
        const selectedRow = SimpleRowFactory.createIdentifiableRow(
            {
                tableIdOrJQuery, rowTmplId: "dogsTableEditableRowTmpl"
            });

        const component = SelectableListFactory.create({items: DbMock.DOGS, tableIdOrJQuery, notSelectedRow, selectedRow});

        component
            .init()
            .then(() => component.doWithState((selectableListState) => {
                selectableListState.createNewItem().name = `new dog (with table ${tableRelativePositionOnCreate})`;
                selectableListState.updateItem({id: 3, name: "updated dog3"});
                selectableListState.removeById(2);
                selectableListState.insertItem({
                    id: 2,
                    name: `restored dog2 (with table ${tableRelativePositionOnCreate})`
                }, tableRelativePositionOnCreate === "append");
            }));
    })
} else {
    // Find another way to add the rows to the table because
    // the HTML template element is not supported.
}
