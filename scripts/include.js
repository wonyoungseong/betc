function includeHTML(callback) {
    var elements = document.querySelectorAll('[include-html]');
    var totalElements = elements.length;
    var loadedCount = 0;

    if (totalElements === 0) {
        callback();
    }

    elements.forEach(function(elmnt) {
        var file = elmnt.getAttribute("include-html");
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (this.readyState == 4) {
                if (this.status == 200) {
                    elmnt.innerHTML = this.responseText;
                }
                if (this.status == 404) {
                    elmnt.innerHTML = "Page not found.";
                }
                elmnt.removeAttribute("include-html");
                loadedCount++;
                if (loadedCount === totalElements) {
                    callback();
                }
            }
        }
        xhr.open("GET", file, true);
        xhr.send();
    });
}
