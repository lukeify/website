import {Controller} from "@hotwired/stimulus";

export default class extends Controller {
    static targets = ['primary', 'secondary'];

    primaryTargetDataAttribute = 'data-xmb-primary-active';
    secondaryTargetDataAttribute = 'data-xmb-secondary-active';
    secondaryBackgroundedTargetDataAttribute = 'data-xmb-secondary-backgrounded';

    get previousPrimaryTarget() {
        return this.activePrimaryTarget.previousElementSibling;
    }

    get nextPrimaryTarget() {
        return this.activePrimaryTarget.nextElementSibling;
    }

    get activePrimaryTarget() {
        return this.primaryTargets.find(pt => pt.hasAttribute(this.primaryTargetDataAttribute));
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
        const nextTarget = this.nextPrimaryTarget;
        if (!nextTarget) {
            return;
        }

        this.#setNewPrimaryTarget(nextTarget);
        this.#setTranslation('x', -this.previousPrimaryTarget.getBoundingClientRect().width);
    }

    #xNegative() {
        const prevTarget = this.previousPrimaryTarget;
        if (!prevTarget) {
            return;
        }

        this.#setTranslation('x', this.previousPrimaryTarget.getBoundingClientRect().width);
        this.#setNewPrimaryTarget(prevTarget);
    }

    #zPositive() {
        this.#secondaryTargets();
        const active = this.#activeSecondaryTarget();
        const backgrounded = this.#backgroundedSecondaryTarget();
        active.previousElementSibling.setAttribute('data-xmb-secondary-active', '');
        active.removeAttribute('data-xmb-secondary-active');
        active.setAttribute('data-xmb-secondary-backgrounded', '');
        backgrounded.removeAttribute('data-xmb-secondary-backgrounded');
    }


    #zNegative() {
        this.#activeSecondaryTarget().removeAttribute('data-xmb-secondary-active');
        const backgrounded = this.#backgroundedSecondaryTarget();
        const nextTarget = backgrounded.nextElementSibling;
        backgrounded.removeAttribute('data-xmb-secondary-backgrounded');
        backgrounded.setAttribute('data-xmb-secondary-active', '');
        nextTarget.setAttribute('data-xmb-secondary-backgrounded', '');
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

    #setNewPrimaryTarget(newTarget) {
        this.activePrimaryTarget.removeAttribute(this.primaryTargetDataAttribute);
        newTarget.setAttribute(this.primaryTargetDataAttribute, '');
    }

    #secondaryTargets() {
        return this.secondaryTargets.filter(st => st.parentElement === this.activePrimaryTarget);
    }

    #activeSecondaryTarget() {
        return this.#secondaryTargets().find(st => st.hasAttribute(this.secondaryTargetDataAttribute));
    }

    #backgroundedSecondaryTarget() {
        return this.#secondaryTargets().find(st => st.hasAttribute(this.secondaryBackgroundedTargetDataAttribute));
    }
}
