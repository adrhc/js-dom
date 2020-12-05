class PersonsRepository extends DynaSelOneRepository {
    URL = "http://127.0.0.1:8011/persons";

    /**
     * @return {Promise<Person>}
     */
    getAll() {
        return $.getJSON(this.URL)
            .then(data => RestUtils.prototype.unwrapHAL(data))
            .catch((jqXHR, textStatus, errorThrown) => {
                console.log(textStatus, errorThrown);
                alert(`${textStatus}! loading fallback data`);
                return $.getJSON("test/persons.json");
            });
    }

    /**
     * @param title {String}
     * @returns {PromiseLike<DynaSelOneItem[]> | Promise<DynaSelOneItem[]>}
     */
    findByTitle(title) {
        return $.ajax({
            url: `${this.URL}/search/findByFirstNameStartingWith`,
            data: {firstName: title},
            contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            processData: true
        }).then(data => {
            const items = RestUtils.prototype.unwrapHAL(data);
            return items.map(it => $.extend(true, new Person(), it));
        });
    }

    save(person) {
        if (EntityUtils.prototype.hasEmptyId(person)) {
            return this.insert(person);
        } else {
            return this.update(person);
        }
    }

    update(person) {
        return $.ajax({
            url: `${this.URL}/${person.id}`,
            method: "PUT",
            data: person,
        }).then(it => RestUtils.prototype.unwrapHAL(it));
    }

    insert(person) {
        return $.ajax({
            url: this.URL,
            method: "POST",
            data: person,
        }).then(it => RestUtils.prototype.unwrapHAL(it));
    }
}