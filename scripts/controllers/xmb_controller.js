import {Controller} from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ['x', 'z'];

    xAxisTargetDataAttr = 'data-xmb-x-active';
    zAxisTargetDataAttr = 'data-xmb-z-active';
    bounceClass = 'xmb--bounce';
    zAxisBounce = 5;
    xAxisBounce = 50;

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

    /**
     * When a bounce animation is complete, signifying the end of the axis to the user when they attempted to navigate
     * further, remove the bounce class that was added to trigger the CSS animation.
     *
     * @param event
     */
    bounceComplete(event) {
        event.target.classList.remove(this.bounceClass);
    }

    /**
     * Navigates rightwards using the right arrow key.
     */
    #xPositive() {
        const next = this.nextXTarget;

        if (next) {
            this.#setNewXTarget(next);
            this.#setTranslation('x', -this.previousXTarget.getBoundingClientRect().width);
        } else {
            this.element.style.setProperty(`--x-translation-bounce`, `-50px`);
            if (this.element.classList.contains(this.bounceClass)) {
                this.element.classList.remove(this.bounceClass);
                void this.element.offsetWidth;
            }
            this.element.classList.add(this.bounceClass);
        }
    }

    /**
     * Navigates leftwards using the left arrow key.
     */
    #xNegative() {
        const prev = this.previousXTarget;

        if (prev) {
            this.#setTranslation('x', this.previousXTarget.getBoundingClientRect().width);
            this.#setNewXTarget(prev);
        } else {
            this.element.style.setProperty(`--x-translation-bounce`, `50px`);
            if (this.element.classList.contains(this.bounceClass)) {
                this.element.classList.remove(this.bounceClass);
                void this.element.offsetWidth;
            }
            this.element.classList.add(this.bounceClass);
        }
    }

    /**
     * Navigates backwards to the target behind the user's camera using the up arrow key.
     */
    #zPositive() {
        const active = this.#activeZTarget();

        if (active.previousElementSibling) {
            active.previousElementSibling.setAttribute(this.zAxisTargetDataAttr, '');
            active.removeAttribute(this.zAxisTargetDataAttr);
        } else {
            this.element.style.setProperty(`--z-translation-z-bounce`, `-5px`);
            const el = this.activeXTarget.querySelector('.xmb__z-stack');
            if (el.classList.contains(this.bounceClass)) {
                el.classList.remove(this.bounceClass);
                void el.offsetWidth;
            }
            el.classList.add(this.bounceClass);
        }
    }

    /**
     * Navigates forwards to the next target in front of the user's camera using the down arrow key.
     */
    #zNegative() {
        const active = this.#activeZTarget();

        if (active.nextElementSibling) {
            active.nextElementSibling.setAttribute(this.zAxisTargetDataAttr, '');
            active.removeAttribute(this.zAxisTargetDataAttr);
        } else {
            this.element.style.setProperty(`--z-translation-z-bounce`, `5px`);
            const el = this.activeXTarget.querySelector('.xmb__z-stack');
            if (el.classList.contains(this.bounceClass)) {
                el.classList.remove(this.bounceClass);
                void el.offsetWidth;
            }
            el.classList.add(this.bounceClass);
        }
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

    /**
     * Retrieve all `z` targets for the currently active `x` target.
     *
     * @returns {HTMLElement[]}
     */
    #zTargets() {
        return this.zTargets.filter(zt => this.activeXTarget.contains(zt));
    }

    /**
     * Retrieves the currently active `z` target for the currently active `x` target. One element is always active,
     * so this should never return `undefined`.
     *
     * @returns {HTMLElement}
     */
    #activeZTarget() {
        return this.#zTargets().find(zt => zt.hasAttribute(this.zAxisTargetDataAttr));
    }
}
