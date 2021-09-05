import { areEqualArray, areEqualLookupArray } from "../equalExt";
import { ExtendedContextBase } from "./base";

export class SafeAttributeContext extends ExtendedContextBase {
    public addOnChange(
        attributeName: string | string[],
        handler: (context?: XdtXrm.ExecutionContext<XdtXrm.Attribute<any>, undefined>) => any,
    ): void {
        if (Array.isArray(attributeName)) {
            attributeName.map((a) => this.addOnChange(a, handler));
            return;
        }
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }
        att.addOnChange(handler);
    }

    public fireOnChange(attributeName: string): void {
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }
        att.fireOnChange();
    }

    public getRequired(attributeName: string): boolean {
        const att = this.getAttribute(attributeName);
        if (!att) {
            return false;
        }
        return att.getRequiredLevel() === "required";
    }

    public getSubmitMode(attributeName: string): XdtXrm.AttributeSubmitMode {
        const att = this.getAttribute(attributeName);
        if (!att) {
            return "never";
        }
        return att.getSubmitMode();
    }

    public getValue(attributeName: string): any | null {
        const att = this.getAttribute(attributeName);
        if (!att) {
            console.warn(
                `An attempt to retrieve attribute with name ${attributeName} was made, but no attribute exists with that name!`,
            );
            return null;
        }
        let value = att.getValue();
        if (att.getAttributeType() === "lookup" && value) {
            switch ((value as []).length) {
                case 0:
                    value = null;
                    break;
                default:
                    value = value[0];
                    break;
            }
        }

        return value;
    }

    public removeOnChange(
        attributeName: string | string[],
        handler: (context?: XdtXrm.ExecutionContext<XdtXrm.Attribute<any>, undefined>) => any,
    ): void {
        if (Array.isArray(attributeName)) {
            attributeName.map((a) => this.removeOnChange(a, handler));
            return;
        }
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }
        att.removeOnChange(handler);
    }

    public setSubmitMode(
        attributeName: string | string[],
        submitMode: boolean | XdtXrm.AttributeSubmitMode = true,
    ): void {
        if (Array.isArray(attributeName)) {
            attributeName.map((a) => this.setSubmitMode(a, submitMode));
            return;
        }
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }

        switch (submitMode) {
            case true:
            case "always":
                submitMode = "always";
                break;
            case "dirty":
                submitMode = "dirty";
                break;
            case "never":
            case false:
                submitMode = "never";
                break;
            default:
                console.error(
                    `SafeAttribute.setSubmitMode -  Value ${submitMode} is invalid.  Valid values for the level argument are 'always', 'dirty' or 'never'`,
                );
                return;
        }
        att.setSubmitMode(submitMode);
    }

    public setRequired(attributeName: string | string[], required = true): void {
        if (Array.isArray(attributeName)) {
            attributeName.map((a) => this.setRequired(a, required));
            return;
        }
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }
        att.setRequiredLevel(required ? "required" : "none");
    }

    public setValue(attributeName: string, id: string, entityType: string, name: string, fireOnChange?: boolean): void;
    public setValue(attributeName: string, value: unknown, fireOnChange?: boolean): void;
    public setValue(
        attributeName: string,
        valueOrId: unknown | string,
        fireOnChangeEntityType?: boolean | string,
        name?: string,
        fireOnChange = true,
    ): void {
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }

        if (att.getAttributeType() === "lookup") {
            let value = valueOrId as XdtXrm.EntityReference<string>;
            if (!Array.isArray(value)) {
                // Potentially convert overload to to Entity Reference and handle array setting
                if (valueOrId && !value.id && !value.entityType) {
                    value = {
                        id: valueOrId as string,
                        name: name,
                        entityType: fireOnChangeEntityType as string,
                    };
                }
                value = (value ? [value] : []) as any;
            }
            (value as unknown as { id: string }[]).forEach((v) => (v.id = this.removeCurlyBraces(v.id)));
            valueOrId = value;
        } else {
            fireOnChange = (fireOnChangeEntityType === undefined ? true : fireOnChangeEntityType) as boolean;
        }

        if (fireOnChange) {
            const previousValue = att.getValue();
            att.setValue(valueOrId);
            this.fireOnChangeIfValueIsDifferent(att, previousValue, valueOrId);
        } else {
            att.setValue(valueOrId);
        }
    }

    private fireOnChangeIfValueIsDifferent(att: XdtXrm.Attribute<any>, previousValue: unknown, value: unknown): void {
        let fireOnChange: boolean;
        // Only fire if value is changing
        switch (att.getAttributeType()) {
            case "lookup":
                fireOnChange = !areEqualLookupArray(previousValue as XdtXrm.Lookup[], value as XdtXrm.Lookup[]);
                break;

            case "multiselectoptionset":
                fireOnChange = !areEqualArray(previousValue as [], value as []);
                break;

            default:
                fireOnChange = previousValue !== value;
                break;
        }

        if (fireOnChange) {
            att.fireOnChange();
        }
    }

    private removeCurlyBraces(text: string): string {
        return text.replace(/[{}]/g, "");
    }
}
