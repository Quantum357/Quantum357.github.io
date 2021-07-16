var PIXELS_PER_INCH;
var FPS = 50;
var mouseX = 0;
var mouseY = 0;
var mousedown = false;
var ctx;
var backgroundImg = new Image();
backgroundImg.src = "field20.png";

var path = [];
var mouseReleased = true;
var selectedNode = 0;
var draggingNode = false;

var snapNodesToGrid = false;
var gridWidth;
var gridHeight;

var rect;

function start() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    PIXELS_PER_INCH = backgroundImg.width / 360;

    rect = canvas.getBoundingClientRect();
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX-rect.left;
        mouseY = event.clientY-rect.top;

        if (snapNodesToGrid) {
            gridWidth = document.getElementById("gridWidth").value;
            gridHeight = document.getElementById("gridHeight").value;
            
            if (gridWidth > 0 && gridHeight > 0) {
                mouseX = Math.round(mouseX / (backgroundImg.width / gridWidth)) * (backgroundImg.width / gridWidth);
                mouseY = Math.round(mouseY / (backgroundImg.height / gridHeight)) * (backgroundImg.height / gridHeight);
            }
        }
    });

    canvas.addEventListener('mousedown', (event) => {
        mousedown = true;
    });

    canvas.addEventListener('mouseup', (event) => {
        mousedown = false;
    });

    document.addEventListener('keydown', (event) => {
        event.preventDefault();
        switch (event.key) {
            case 'Control':
                snapNodesToGrid = true;
                break;
        }
    });

    document.addEventListener('keyup', (event) => {
        event.preventDefault();
        switch (event.key) {
            case 'Control':
                snapNodesToGrid = false;
                break;
        }
    });
}

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2);
}

function getSubPoint(x1, y1, x2, y2, percent) {
    d = getDistance(x1, y1, x2, y2);
    t = percent / d;
    return [((1 - t) * x1 + t * x2), ((1 - t) * y1 + t * y2)];
}
//==================================================
//button events
function save() {
    path.splice(0, 0, Math.round(PIXELS_PER_INCH*100)/100);
    pathString = path.join(",");
    splitLines = str => str.split(/\r?\,/);
    data = splitLines(pathString);
    download(document.getElementById("filename").value, data);
}

function load() {

}

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function remove() {
    path.splice(selectedNode, 1);
    selectedNode--;
}

function clearPath() {
    path = [];
}

//==================================================

function update() {
    //reset canvas
    canvas.width = backgroundImg.width;
    canvas.height = backgroundImg.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //place points
    if (mousedown) {
        pointFound = false;
        if (mouseReleased || draggingNode) {
            for (i = 0; i < path.length; i++) {
                if (getDistance(path[i][0], path[i][1], mouseX, mouseY) < 5 || (draggingNode && i == selectedNode)) {
                    selectedNode = i;
                    // replace node with new position
                    path[selectedNode] = [mouseX, mouseY];
                    pointFound = true;
                    draggingNode = true
                }
            }
            if (path.length > 1 && !draggingNode) {
                for (i = 0; i < path.length - 1; i++) {
                    for (j = 0; j < getDistance(path[i][0], path[i][1], path[i+1][0], path[i+1][1]); j++) {
                        p = getSubPoint(path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], j);

                        if (getDistance(p[0], p[1], mouseX, mouseY) < 10) {
                            path.splice(i+1, 0, [mouseX, mouseY]);
                            selectedNode = i + 1;
                            pointFound = true;
                            break;
                        }
                    }
                    if (pointFound) {
                        break;
                    }
                }
            }
            if (!pointFound && !draggingNode) {
                path.push([mouseX, mouseY]);
                selectedNode = path.length - 1;
            }
        }

        mouseReleased = false
    } else {
        mouseReleased = true
        draggingNode = false;
    }

    //draw all
    ctx.drawImage(backgroundImg, 0, 0);


    if (path.length > 0) {
        ctx.beginPath();
        ctx.fillStyle = "BLACK";
        ctx.moveTo(path[0][0]-6, path[0][1]);
        for (i=1; i < path.length; i++) {
            ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.stroke();

        for (i=0; i < path.length; i++) {
            if (i == selectedNode) {
                ctx.fillStyle = "ORANGE";
            } else {
                ctx.fillStyle = "BLACK";
            }
            ctx.fillRect(path[i][0]-5, path[i][1]-5, 10, 10);
        }
    }

    ctx.fillStyle = "YELLOW"
    ctx.fillRect(mouseX-5, mouseY-5, 10, 10);

    rect = canvas.getBoundingClientRect();

}

setInterval(update, 1000 / FPS);