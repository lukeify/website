import {Controller} from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ['x', 'z'];

    xAxisTargetDataAttr = 'data-xmb-x-active';
    zAxisTargetDataAttr = 'data-xmb-z-active';

    get previousXTarget() {
        return this.activeXTarget.previousElementSibling;
    }

    get nextXTarget() {
        return this.activeXTarget.nextElementSibling;
    }

    get activeXTarget() {
        return this.xTargets.find(xt => xt.hasAttribute(this.xAxisTargetDataAttr));
    }

    handleKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                this.#zPositive();
                break;
            case 'ArrowDown':
                this.#zNegative();
                break;
            case 'ArrowRight':
                this.#xPositive();
                break;
            case 'ArrowLeft':
                this.#xNegative();
                break;
        }
    }

    #xPositive() {
        const next = this.nextXTarget;
        if (!next) {
            return;
        }

        this.#setNewXTarget(next);
        this.#setTranslation('x', -this.previousXTarget.getBoundingClientRect().width);
    }

    #xNegative() {
        const prev = this.previousXTarget;
        if (!prev) {
            return;
        }

        this.#setTranslation('x', this.previousXTarget.getBoundingClientRect().width);
        this.#setNewXTarget(prev);
    }

    #zPositive() {
        this.#zTargets();
        const active = this.#activeZTarget();
        active.previousElementSibling.setAttribute(this.zAxisTargetDataAttr, '');
        active.removeAttribute(this.zAxisTargetDataAttr);
    }


    #zNegative() {
        const active = this.#activeZTarget();
        active.nextElementSibling.setAttribute(this.zAxisTargetDataAttr, '');
        this.#activeZTarget().removeAttribute(this.zAxisTargetDataAttr);
    }

    #currentTranslation() {
        const computedStyle = window.getComputedStyle(this.element);
        return {
            x: parseFloat(computedStyle.getPropertyValue('--x-translation')),
            z: parseFloat(computedStyle.getPropertyValue('--z-translation'))
        };
    }

    #setTranslation(axis, adjustment) {
        const newValue = this.#currentTranslation()[axis] + adjustment;
        this.element.style.setProperty(`--${axis}-translation`, `${newValue}px`);
    }

    #setNewXTarget(newTarget) {
        this.activeXTarget.removeAttribute(this.xAxisTargetDataAttr);
        newTarget.setAttribute(this.xAxisTargetDataAttr, '');
    }

    #zTargets() {
        return this.zTargets.filter(zt => zt.parentElement === this.activeXTarget);
    }

    #activeZTarget() {
        return this.#zTargets().find(zt => zt.hasAttribute(this.zAxisTargetDataAttr));
    }
}
