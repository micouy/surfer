let sampler1 = {}, sampler2 = {};
let ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);
ws.onmessage = (mess) => console.log(mess.data);

function send(method, params) {
    let message = JSON.stringify({ method: method, params: params });
    console.log(message);
    ws.send(message);
}

function sendKey(number, down) {
    send('key', { number, down });
}

function sendDot(down) {
    send('dot', { down });
}

function sendLine(value) {
    send('line', { value });
}

let keysPressed = {};

let style = {
    highlight: '#FFB200',
    keyFill: '#D40000',
    keyTextFill: '#FFFFFF',
    keyLinewidth: 0,
    keyPressedLinewidth: 0,
}

let ui = {
    pad: {},
};

let two;

function bind(key, number) {
    keysPressed[key] = false;

    keyboardJS.bind(
        key,
        (_) => {
            if (!keysPressed[key]) {
                sendKey(number, true);
                keysPressed[key] = true;
                ui.pad[key].linewidth = style.keyPressedLinewidth;
                ui.pad[key].text.fill = style.highlight;
                two.update();
            }
        },
        (_) => {
            sendKey(number, false);
            keysPressed[key] = false;
            ui.pad[key].linewidth = style.keyLinewidth;
            ui.pad[key].text.fill = style.keyTextFill;
            two.update();
        }
    );
}

// first row
bind('6', 0);
bind('7', 1);
bind('8', 2);
bind('9', 3);

// second row
bind('y', 4);
bind('u', 5);
bind('i', 6);
bind('o', 7);

// third row
bind('h', 8);
bind('j', 9);
bind('k', 10);
bind('l', 11);

// fourth row
bind('n', 12);
bind('m', 13);
bind(',', 14);
bind('.', 15);

keyboardJS.bind(
    'z',
    (_) => {
        if (!keysPressed.dot) {
            keysPressed.dot = true;
            ui.dot.highlight();
            sendDot(true);
        }
    },
    (_) => {
        keysPressed.dot = false;
        ui.dot.lowlight();
        sendDot(false);
    }
);


function draw() {
    let elem = document.getElementById('surfer');
    let params = { fullscreen: true };
    two = new Two(params).appendTo(elem);

    let keys = [
        /*
        ['7', '8', '9'],
        ['u', 'i', 'o'],
        ['j', 'k', 'l'],
        ['m', ',', '.'],
        */
        ['6', '7', '8' , '9'],
        ['y', 'u', 'i' , 'o'],
        ['h', 'j', 'k', 'l'],
        ['n', 'm', ',', '.'],
    ];

    let pad = { x: 50, y: 50 };
    let padding = 15;

    let fill = style.keyFill;
    let stroke = style.keyFill;
    let linewidth = style.keyLinewidth;
    let textStyle = {
        family: 'Rubik',
        fill: style.keyTextFill,
        size: 25,
    };

    // make rows and the exclamation mark skewed

    for (let row = 0; row < keys.length; row++) {
        for (let key = 0; key < keys[row].length; key++) {
            let keyName = keys[row][key];
            let x = pad.x + padding + key * (KEY_SIZE + padding) + KEY_SIZE / 2 + row * KEY_SIZE * 1 / 3;
            let y = pad.y + padding + row * (KEY_SIZE + padding) + KEY_SIZE / 2;
            let rect = new Two.RoundedRectangle(x, y, KEY_SIZE, KEY_SIZE, CORNER_RADIUS);
            let text = new Two.Text(keyName, x + KEY_SIZE / 3, y + KEY_SIZE / 3, textStyle);
            two.add(rect, text);
            rect.text = text;
            rect.fill = fill;
            rect.stroke = stroke;
            rect.linewidth = linewidth;
            ui.pad[keyName] = rect;
        }
    }

    let maxLength = keys.reduce((max, row) => Math.max(max, row.length), 0);
    let padWidth = maxLength * (KEY_SIZE + padding) + padding + KEY_SIZE;

    let dotOffset = new Two.Vector(
        pad.x + KEY_SIZE * 5 / 3 - padding,
        pad.y + 4 * (KEY_SIZE + padding) + padding,
    );
    ui.dot = new Dot(two, dotOffset);
    let lineOffset = new Two.Vector(
        pad.x + KEY_SIZE * 5 / 3 + KEY_SIZE,
        pad.y + + 4 * (KEY_SIZE + padding) + padding,
    );

    ui.line = new Line(two, lineOffset, 0, 1, (value) => {
        sendLine(value);
    });

    two.update();
}

let ready = {
    window: false,
    ws: false,
};

function allReady(ready) {
    for (let prop in ready) {
        if (!ready[prop]) { return false; }
    }

    return true;
}

window.onload = (_) => {
    ready.window = true;

    if (allReady(ready)) {
        draw();
    }
}

ws.onopen = (_) => {
    ready.ws = true;

    if (allReady(ready)) {
        draw();
    }
}
