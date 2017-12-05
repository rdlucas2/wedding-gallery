var full = document.getElementById('full');

function loadJSON(callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'photos.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getImageIndex(images, image) {
    var selectedId = getParameterByName('id', image.src);
    var index = -1;
    for (var i = 0; i < images.length; i++) {
        var currentId = getParameterByName('id', images[i].src);
        if (currentId === selectedId) {
            index = i;
            break;
        }
    }

    return index;
}

var hideFull = function(event) {
    while (full.firstChild) {
        full.removeChild(full.firstChild);
    }
    full.style.display = 'none';
}

function setupFullDisplay(image) {
    var imageCollection = document.getElementById('images').children;
    var images = [].slice.call(imageCollection);
    var index = getImageIndex(images, image);

    var hasPrevious = index > 0;
    if (hasPrevious) {
        var previous = document.createElement('div');
        previous.innerHTML = "&larr;";
        previous.setAttribute('id', 'previous');
        previous.addEventListener('click', function(event) {
            hideFull();
            var id = getParameterByName('id', images[index - 1].src)
            var source = 'https://drive.google.com/thumbnail?export=view&id=' + id + '&sz=w' + window.innerWidth + '-h' + window.innerHeight;
            loadImage(source);
        });
        full.appendChild(previous);
    }


    var hasNext = index < images.length - 1;
    if (hasNext) {
        var next = document.createElement('div');
        next.innerHTML = "&rarr;";
        next.setAttribute('id', 'next');
        next.addEventListener('click', function(event) {
            hideFull();
            var id = getParameterByName('id', images[index + 1].src)
            var source = 'https://drive.google.com/thumbnail?export=view&id=' + id + '&sz=w' + window.innerWidth + '-h' + window.innerHeight;
            loadImage(source);
        });
        full.appendChild(next);
    }
}

function onImageLoaded(image) {
    image.setAttribute('id', 'photo');
    image.addEventListener('click', hideFull, false);
    setupFullDisplay(image);
    full.appendChild(image);
    full.style.display = 'block';
}

function loadImage(source) {
    var image = new Image();
    image.src = source;
    // image.setAttribute('height', '100%'); //may want to scale it to max height
    image.onload = onImageLoaded(image);
}

var displayFull = function(event) {
    var originalSrc = event.target.getAttribute('src');
    var id = getParameterByName('id', originalSrc);
    //image size based on window (faster)
    var source = 'https://drive.google.com/thumbnail?export=view&id=' + id + '&sz=w' + window.innerWidth + '-h' + window.innerHeight;
    //full quality image (slow load)
    // var source = 'https://drive.google.com/uc?export=view&id=' + id;
    loadImage(source);
};

window.onresize = function(event) {
    if (full.style.display !== 'none' && full.hasChildNodes) {
        full.children[0].setAttribute('height', '100%');
    }
}

loadJSON(function(response) {
    // Parse JSON string into object
    var json = JSON.parse(response);

    //for (var i = 0; i < json.photos.length; i++) {
    for (var i = json.photos.length - 1; i >= 0; i--) {
        var image = new Image();
        image.src = json.photos[i];
        // image.src = json.photos[i] + '&sz=w' + parseInt(window.innerWidth / 8) + '-h' + parseInt(window.innerHeight / 8);
        image.setAttribute('class', 'thumbnail');
        document.getElementById('images').appendChild(image);
    }

    var thumbnails = document.getElementsByClassName("thumbnail");
    for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].addEventListener('click', displayFull, false);
    }
});