const KEY_SIZE = 40;
const PADDING = 15;
const FONT_FAMILY = 'Rubik';
const FONT_SIZE = 25;
const CORNER_RADIUS = 5;

class UI {
    constructor(two) {
        this.pads = {};
        // this.dot =
    }
}

// class UIElement {
//     constructor(group, offset, size, params)
// }

class Dot {
    static cornerRadius = CORNER_RADIUS;
    static size = KEY_SIZE;
    static fill = '#0A3FFF';
    static highlight = '#00ADFF';

    constructor(two /*, group */, offset) {
        let size = new Two.Vector(Dot.size, Dot.size);
        let center = offset.clone().add(size.clone().multiplyScalar(0.5));
        this.key = new Two.RoundedRectangle(center.x, center.y, size.x, size.y, Dot.cornerRadius);
        this.key.fill = Dot.fill;
        this.key.linewidth = 0;

        this.two = two;
        // group.add(this.key);
        this.two.add(this.key);
        this.two.update();
    }

    highlight() {
        this.key.fill = Dot.highlight;
        this.two.update();
    }

    lowlight() {
        this.key.fill = Dot.fill;
        this.two.update();
    }
}

class Line {
    // TODO change to global constants
    static width = 3 * KEY_SIZE + 2 * PADDING;
    static height = KEY_SIZE;;
	static cornerRadius = CORNER_RADIUS;
	static fill = '#FF9B13';
	static labelFill = '#FFFFFF';

    constructor(two, offset, min, max, onwheelCallback) {
        this.two = two;
        this.onwheelCallback = onwheelCallback;
        this.min = min;
        this.max = max;
        this.step = (max - min) * 0.003;

        let size = new Two.Vector(Line.width, Line.height);
        let center = offset.add(size.clone().multiplyScalar(0.5));

		this.value = (max + min) * 0.5;
		this.onwheelCallback(this.value);
		this.slider = new Two.RoundedRectangle(center.x, center.y, size.x, size.y, Line.cornerRadius);
		this.slider.fill = Line.fill;
		this.slider.linewidth = 0;

		this.label = new Two.Text(numeral(this.value).format('0.0a'), center.x, center.y);
		this.label.fill = Line.labelFill;
		this.label.family = FONT_FAMILY;
		this.label.size = FONT_SIZE;

		this.two.add(this.slider, this.label);
		this.two.update();

		// make the label ignore the wheel event
		let labelElem = document.getElementById(this.label.id);
		labelElem.style.pointerEvents = 'none';

		let sliderElem = document.getElementById(this.slider.id);
		sliderElem.onwheel = (e) => {
    		e.preventDefault();

        	this.value += -e.deltaX * this.step;
        	this.value = Math.min(this.value, this.max);
        	this.value = Math.max(this.value, this.min);
    		this.label.value = numeral(this.value).format('0.0a');
    		this.two.update();
    		this.onwheelCallback(this.value);
		};
    }
}
