import {Controller} from "@hotwired/stimulus";
import {asPx, overlappingBounds} from "../utils";

export default class extends Controller {
    static targets = ['x', 'xHeading', 'z'];

    xAxisTargetDataAttr = 'data-xmb-x-active';
    zAxisTargetDataAttr = 'data-xmb-z-active';
    bounceClass = 'xmb--bounce';
    bounce = {
        x: {
            distance: 50,
            customProperty: '--x-translation-bounce',
            elementFn: () => this.element
        },
        z: {
            distance: 5,
            customProperty: '--z-translation-z-bounce',
            elementFn: () => this.activeXTarget.querySelector('.xmb__z-stack')
        }
    };
    zItemBoundingClientRect = null;

    get previousXTarget() {
        return this.activeXTarget.previousElementSibling;
    }

    get nextXTarget() {
        return this.activeXTarget.nextElementSibling;
    }

    get activeXTarget() {
        return this.xTargets.find(xt => xt.hasAttribute(this.xAxisTargetDataAttr));
    }

    /**
     * On connection, compute the y-offset for the z-target, and pre-measure the boundingClientRect for the current
     * z-item before any transformations are applied.
     */
    connect() {
        this.#computeYOffsetForZTarget(this.#activeZTarget());
        this.zItemBoundingClientRect = this.#activeZTarget().getBoundingClientRect();
    }

    handleKeydown(event) {
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.#zPositive();
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.#zNegative();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.#xPositive();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.#xNegative();
                break;
        }
    }

    /**
     * Navigate to the recently clicked header element.
     *
     * The order of setting a new active target and setting the x-axis translation must depend on the relative position
     * of the previously active target and the newly active target because the font weight of the active target differs
     * from inactive targets which makes the computed translation incorrect if done in the wrong order.
     *
     * @param event
     */
    handleHeaderClick(event) {
        const prevTarget = this.activeXTarget;
        const xTarget = this.xTargets.find(xt => xt.contains(event.target));

        if (prevTarget.compareDocumentPosition(xTarget) & Node.DOCUMENT_POSITION_FOLLOWING) {
            this.#setNewTarget('x', xTarget);
            this.#setXTranslation(prevTarget.getBoundingClientRect().left - xTarget.getBoundingClientRect().left);
        } else {
            this.#setXTranslation(prevTarget.getBoundingClientRect().left - xTarget.getBoundingClientRect().left);
            this.#setNewTarget('x', xTarget);
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
     * Scrolls within the currently active z-item should cause the x-axis mask on the headings to be recomputed.
     *
     * @param event
     */
    scrollWithinItem(event) {
        this.#computeXAxisMask(event.target, 0);
    }

    /**
     * Because the page itself is not scrolled, but rather the z-item container is, we need to associate scroll events
     * that occur outside this container with the z-item, and scroll the z-item accordingly.
     *
     * @param event
     */
    handleWheelOutsideItem(event) {
        if (!this.#activeZTarget().contains(event.target)) {
            this.#activeZTarget().scrollTop += event.deltaY;
            this.#computeXAxisMask(event.target, 0);
        }
    }

    /**
     * Navigates rightwards using the right arrow key.
     */
    #xPositive() {
        const next = this.nextXTarget;

        if (next) {
            this.#setNewTarget('x', next);
            this.#setXTranslation(-this.previousXTarget.getBoundingClientRect().width);
            this.#computeXAxisMask(this.#activeZTarget(), -this.previousXTarget.getBoundingClientRect().width);
        } else {
            this.#performAxisBounce('x', -1);
        }
    }

    /**
     * Navigates leftwards using the left arrow key.
     */
    #xNegative() {
        const prev = this.previousXTarget;

        if (prev) {
            const prevWidth = prev.getBoundingClientRect().width;
            this.#setXTranslation(prevWidth);
            this.#setNewTarget('x', prev);
            this.#computeXAxisMask(this.#activeZTarget(), prevWidth);
        } else {
            this.#performAxisBounce('x', 1);
        }
    }

    /**
     * Navigates backwards to the target behind the user's camera using the up arrow key. If there is no previous
     * target, performs a bounce animation to signify the end of the axis to the user.
     */
    #zPositive() {
        const active = this.#activeZTarget();

        if (active.previousElementSibling) {
            this.#setNewTarget('z', active.previousElementSibling);
            this.#computeXAxisMask(this.#activeZTarget(), 0);
        } else {
            this.#performAxisBounce('z', -1);
        }
    }

    /**
     * Navigates forwards to the next target in front of the user's camera using the down arrow key. If there is no
     * next target, performs a bounce animation to signify the end of the axis to the user.
     */
    #zNegative() {
        const active = this.#activeZTarget();

        if (active.nextElementSibling) {
            this.#setNewTarget('z', active.nextElementSibling);
            this.#computeXAxisMask(this.#activeZTarget(), 0);
        } else {
            this.#performAxisBounce('z', 1);
        }
    }

    #setXTranslation(adjustment) {
        const currTranslation = parseFloat(
            window.getComputedStyle(this.element).getPropertyValue('--x-translation')
        );
        this.element.style.setProperty(`--x-translation`, asPx(currTranslation + adjustment));
    }

    #setNewTarget(axis, tgt) {
        const active = axis === 'x' ? this.activeXTarget : this.#activeZTarget();
        const dataAttr = axis === 'x' ? this.xAxisTargetDataAttr : this.zAxisTargetDataAttr;

        active.removeAttribute(dataAttr);
        tgt.setAttribute(dataAttr, '');

        this.#computeYOffsetForZTarget(this.#activeZTarget());
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

    /**
     * Computes the `y` offset for the provided `z` target so it is initially in the same location as it was placed in
     * the DOM, but allows for scrolling with the entirety of the y-axis of the viewport. This is only computed once
     * for a `z` target, the first time it becomes active.
     *
     * @param tgt
     */
    #computeYOffsetForZTarget(tgt) {
        if (tgt.style.top === '') {
            const offset = tgt.getBoundingClientRect().top;
            tgt.style.top = asPx(-offset);
            tgt.style.paddingBlockStart = asPx(offset);
        }
    }

    /**
     * When the end of an axis is reached, a bounce animation should be performed to signify this to the user. The
     * parameters and properties of the bounce animation are contained within the `bounce` property of this controller.
     *
     * @param axis
     * @param dir
     */
    #performAxisBounce(axis, dir) {
        this.element.style.setProperty(this.bounce[axis].customProperty, asPx(this.bounce[axis].distance * dir));
        const el = this.bounce[axis].elementFn();

        if (el.classList.contains(this.bounceClass)) {
            el.classList.remove(this.bounceClass);
            void el.offsetWidth;
        }
        el.classList.add(this.bounceClass);
    }

    /**
     * Given a z-axis target, compute the mask that should be applied to the x-axis headings. If the z-axis target has
     * a non-zero scroll top value, then the mask should be applied to the headings.
     *
     * @param zTgt
     * @param xTranslationAdjustment
     */
    #computeXAxisMask(zTgt, xTranslationAdjustment) {
        this.xHeadingTargets.forEach(h => {
            const headingRect = h.getBoundingClientRect();
            const overlap = overlappingBounds(this.zItemBoundingClientRect, {
                left: headingRect.left + xTranslationAdjustment,
                right: headingRect.right + xTranslationAdjustment,
                top: headingRect.top,
                bottom: headingRect.bottom,
                width: headingRect.width,
                height: headingRect.height
            });

            if (overlap) {
                h.classList.add(`xmb__x-heading--masked`);
                const maskTransparency = 100 - Math.min(100, zTgt.scrollTop);
                h.style.setProperty(`--mask-transparency`, `${maskTransparency}%`);
                h.style.setProperty('--overlap-left', asPx(overlap.left));
                h.style.setProperty('--overlap-right', asPx(overlap.right));
            } else {
                h.classList.remove(`xmb__x-heading--masked`);
                h.style.setProperty(`--mask-transparency`, `100%`);
                h.style.setProperty('--overlap-left', asPx(0));
                h.style.setProperty('--overlap-right', asPx(0));
            }
        });
    }
}
