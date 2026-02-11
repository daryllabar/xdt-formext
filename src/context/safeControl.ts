import { SafeAttributeContext } from "./safeAttribute";

export type SetVisibleOptions = {
    setRequired?: boolean | undefined;
    setHierarchyVisibility?: boolean | undefined;
};

export class SafeControlContext extends SafeAttributeContext {
    public clearNotification(attributeName: string, uniqueId?: string): boolean {
        const id = uniqueId || "setNotification_" + attributeName;
        let success = true;
        let called = false;
        this.executeForControls(attributeName, (ctrl) => {
            called = true;
            success = ctrl.clearNotification(id) && success;
        });
        return called && success;
    }

    public getDisabled(attributeName: string): boolean {
        let disabled = true;
        this.executeForControls(attributeName, (ctrl) => {
            disabled = disabled && ctrl.getDisabled();
        });
        return disabled;
    }

    public getLabel(attributeName: string): string {
        let defaultLabel: string | undefined = undefined;
        let label: string | undefined = undefined;
        this.executeForControls(attributeName, (ctrl) => {
            label = ctrl.getLabel();
            if (attributeName === ctrl.getName()) {
                defaultLabel = label;
            }
        });
        return (defaultLabel === undefined ? label : defaultLabel) || "";
    }

    public getVisible(attributeName: string, includeHierarchyVisibility = true): boolean {
        let visible = false;
        this.executeForControls(attributeName, (ctrl) => {
            visible =
                visible ||
                (ctrl.getVisible() &&
                    (!includeHierarchyVisibility ||
                        !ctrl.getParent() || // Should only apply to unit tests where the ctrl does not have a section or a tab.
                        !ctrl.getParent().getParent() ||
                        (ctrl.getParent().getVisible() && ctrl.getParent().getParent().getVisible())));
        });
        return visible;
    }

    public setDisabled(attributeName: string, disabled = true): void {
        this.executeForControls(attributeName, (ctrl) => {
            ctrl.setDisabled(disabled);
        });
    }

    public setFocus(attributeName: string): void {
        const ctrl = this.context.getControl(attributeName);
        if (ctrl) {
            ctrl.setFocus();
            return;
        }
        const att = this.context.getAttribute(attributeName);
        if (att) {
            att.controls.get(0)?.setFocus();
            return;
        }
        console.warn(`SafeControl.setFocus(): No attribute or control found with name ${attributeName}!`);
    }

    public setLabel(attributeName: string, text: string): void {
        this.executeForControls(attributeName, (ctrl) => {
            ctrl.setLabel(text);
        });
    }

    public setNotification(attributeName: string, message: string, uniqueId?: string): boolean {
        const id = uniqueId || "setNotification_" + attributeName;
        let success = true;
        let called = false;
        this.executeForControls(attributeName, (ctrl) => {
            called = true;
            success = ctrl.setNotification(message, id) && success;
        });
        return called && success;
    }

    attributesSetUnrequiredOnInvisible: string[] = [];
    /**
     * Sets the visibility of all contorls with the given attribute name or control if no attribute exists.
     * @param attributeName The name of the attribute to set visibility for all controls.
     * @param visible Sets the visibility of all controls for the given attribute, or control if no attribute exists with the name.
     * @param options
     * ```
     * {
     *   setRequired?: boolean
     *   // If true, will set the required value to the same as the visible.
     *   // If false, will not touch the required value.
     *   // If undefined set required to false when visibile is false, and set true, only if visible is true and it previously set required to none.
     *   setHierarchyVisibility?: boolean
     *   // If true or undefined and visible is true, sets the section and tab of the control to visible.
     * }
     * ```
     */
    public setVisible(attributeName: string, visible = true, options?: SetVisibleOptions): void {
        this.executeForControls(attributeName, (ctrl) => {
            options = options || {};
            ctrl.setVisible(visible);
            if (options.setHierarchyVisibility === true || (options.setHierarchyVisibility === undefined && visible)) {
                ctrl.getParent()?.setVisible(visible);
                ctrl.getParent()?.getParent()?.setVisible(visible);
            }
            if (options.setRequired === false) {
                return;
            }
            // For PCF Controls, they may not have an actual attribute associated with them, so default to attributeName if no attribute is found for the control.
            const attName = ctrl.getAttribute()?.getName() ?? attributeName;
            this.setRequiredOnSetVisible(options, attName, visible);
        });
    }

    private setRequiredOnSetVisible(options: SetVisibleOptions, attributeName: string, visible: boolean) {
        let shouldSetRequired = options.setRequired !== false;
        let indexToRemove = -1;

        if (options.setRequired !== true) {
            const index = this.attributesSetUnrequiredOnInvisible.indexOf(attributeName);
            if (visible) {
                if (index >= 0) {
                    indexToRemove = index;
                } else {
                    shouldSetRequired = false;
                }
            } else if (this.getRequired(attributeName)) {
                if (index < 0) {
                    this.attributesSetUnrequiredOnInvisible.push(attributeName);
                }
            } else if (index > 0) {
                indexToRemove = index;
            }
        }

        if (indexToRemove >= 0) {
            this.attributesSetUnrequiredOnInvisible.splice(indexToRemove, 1);
        }

        if (shouldSetRequired) {
            this.setRequired(attributeName, visible);
        }
    }

    /**
     * Executes for each found control, first searching by attribute, then by control.
     * @param name Attribute or Control Name
     * @param delgate function to execute for each control
     * @returns the number of times the delgate was executed
     */
    private executeForControls(name: string, delgate: XdtXrm.ForEach<XdtXrm.Control<XdtXrm.Attribute<any>>>): number {
        const att = this.context.getAttribute(name);
        if (att) {
            att.controls.forEach(delgate);
            return att.controls.getLength();
        }
        const ctrl = this.getControl(name) as any;
        if (ctrl) {
            delgate(ctrl, 0);
            return 1;
        }

        console.warn(`SafeControl.executeForControls(): No attribute or control found with name ${name}!`);
        return 0;
    }
}
