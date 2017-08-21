"use strict";

var source = $("#template").html();
var template = Handlebars.compile(source);

var APItoHit = "https://sudeepgandhiweb.firebaseio.com/descriptions.json";

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');
    var sParameterName = void 0;

    for (var i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$.get(APItoHit, function (response) {
    console.log(response);
}).done(function (response) {
    var data = response["indraneel"];
    $("#content-placeholder").html(template(data));
}).fail(function (error) {
    console.error(error.message);
});
//# sourceMappingURL=maps/overview.js.map
