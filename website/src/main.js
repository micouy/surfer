
let sampler1 = {}, sampler2 = {};
let ws = new WebSocket(`ws://${window.location.hostname}:${window.location.port}/ws`);
ws.onmessage = (mess) => console.log(mess.data);

function send(method, params) {
    ws.send(JSON.stringify({ method: method, params: params }));
}

function attack(sampler, sound) {
    send('attack', { sound: sound });
}

function release(sampler, sound) {
    send('release', { sound: sound });
}

function setEffect(value) {
    send('set-effect', { value: value });
}

function unsetEffect() {
    send('unset-effect', {});
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

function bind(key, sampler, freq) {
	keysPressed[key] = false;

    keyboardJS.bind(
        key,
        (_) => {
            if (!keysPressed[key]) {
                attack(sampler, freq);
                keysPressed[key] = true;
                ui.pad[key].linewidth = style.keyPressedLinewidth;
            	ui.pad[key].text.fill = style.highlight;
                two.update();
            }
        },
        (_) => {
            release(sampler, freq);
            keysPressed[key] = false;
            ui.pad[key].linewidth = style.keyLinewidth;
            ui.pad[key].text.fill = style.keyTextFill;
            two.update();
        }
    );
}

// first row
bind('6', sampler1, 'D2');
bind('7', sampler1, 'F2');
bind('8', sampler1, 'A2');
bind('9', sampler1, 'C3');

// second row
bind('y', sampler1, 'C2');
bind('u', sampler1, 'E2');
bind('i', sampler1, 'G2');
bind('o', sampler1, 'B2');

// third row
bind('h', sampler2, 'D1');
bind('j', sampler2, 'F1');
bind('k', sampler2, 'A1');
bind('l', sampler2, 'C2');

// fourth row
bind('n', sampler2, 'C1');
bind('m', sampler2, 'E1');
bind(',', sampler2, 'G1');
bind('.', sampler2, 'B1');

keyboardJS.bind(
    'z',
    (_) => {
        if (!keysPressed.dot) {
            keysPressed.dot = true;
            ui.dot.highlight();
			setEffect(ui.line.value);
        }
    },
    (_) => {
        keysPressed.dot = false;
        ui.dot.lowlight();
        unsetEffect();
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

    ui.line = new Line(two, lineOffset, 1500, 10000, (value) => {
    	if (keysPressed.dot) {
        	setEffect(value);
    	}
    });

    two.update();
}

window.onload = (_) => draw();
