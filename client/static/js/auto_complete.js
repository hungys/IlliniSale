var products_bloodhound = new Bloodhound({
    datumTokenizer: function (datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
        url: '/api/product/query/autocomplete?keyword=%QUERY',
        filter: function (results) {
            return $.map(results, function (candidate) {
                return {
                    value: candidate
                };
            });
        }
    }
});

products_bloodhound.initialize();

$(document).ready(function() {
    $('.typeahead').typeahead(null, {
        displayKey: 'value',
        source: products_bloodhound.ttAdapter()
    });
});