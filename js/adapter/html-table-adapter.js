/**
 * Role: adapter to HTMLTableElement
 */
class HtmlTableAdapter {
    constructor(tableId, bodyTmpl) {
        this.tableId = tableId;
        this.bodyTmpl = bodyTmpl;
    }

    deleteRow(index) {
        this.tBody().find("tr").eq(index).remove();
    }

    deleteAllRows() {
        this.tBody().empty();
    }

    tBody() {
        return $(`#${this.tableId} > tbody`);
    }

    renderBody(data) {
        const bodyTmplHtml = $(`#${this.bodyTmpl}`).html();
        const renderedHtml = Mustache.render(bodyTmplHtml, data)
        this.tBody().html(renderedHtml);
    }

    renderRow(index, data, rowTmpl, replace) {
        const rowTmplHtml = $(`#${rowTmpl}`).html();
        const renderedHtml = Mustache.render(rowTmplHtml, data)
        const rowAtIndex = this.tBody().find("tr").eq(index);
        if (replace) {
            rowAtIndex.replaceWith(renderedHtml);
        } else {
            const row = $(renderedHtml);
            if (rowAtIndex.length) {
                rowAtIndex.before(row);
            } else {
                this.tBody().append(row);
            }
        }
    }
}