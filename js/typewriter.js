// typewriter.js
class TypeWriter {
    constructor(element, text, speed = 50) {
        this.element = element;
        this.text = text;
        this.speed = speed;
        this.currentChar = 0;
        this.typeSound = document.getElementById('typeSound');
    }

    type() {
        if (this.currentChar < this.text.length) {
            this.element.textContent += this.text.charAt(this.currentChar);
            this.currentChar++;
            if (this.typeSound) {
                const clone = this.typeSound.cloneNode(true);
                clone.volume = 0.2;
                clone.play();
            }
            setTimeout(() => this.type(), this.speed);
        }
    }

    start() {
        this.element.textContent = '';
        this.currentChar = 0;
        this.type();
    }
}