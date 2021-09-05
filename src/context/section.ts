import { ExtendedAttributeContext } from "./extendedAttribute";

export class SectionContext extends ExtendedAttributeContext {
    private syncedSectionPreviousValuesByNames: { [key: string]: string };

    constructor(executionOrFormContext: XdtXrm.FormContext | XdtXrm.OnLoadEventContext) {
        super(executionOrFormContext);
        this.syncedSectionPreviousValuesByNames = {};
    }

    public getSections(): XdtXrm.PageSection[] {
        const sectionsByTab = this.context.ui.tabs.get().map((t) => {
            return t.sections.get();
        });
        let flattened = [] as XdtXrm.PageSection[];
        for (const tab of sectionsByTab) {
            flattened = flattened.concat(tab);
        }
        return flattened;
    }

    public syncSectionVisibilityToSelectedValueByName(attributeName: string): void {
        if (!attributeName) {
            console.error("Section.syncSectionVisibilityToSelectedValueByName(): No attributeName given!");
            throw new Error("Section.syncSectionVisibilityToSelectedValueByName(): No attributeName given!");
        }
        const att = this.getAttribute(attributeName);
        if (!att) {
            return;
        }
        switch (att.getAttributeType()) {
            case "lookup":
                this.syncedSectionPreviousValuesByNames[attributeName] = this.getDisplayValue(attributeName);
                this.addOnChange(attributeName, () =>
                    this.setSectionVisiblityToSelectedLookupValueByName(attributeName),
                );
                this.setSectionVisiblityToSelectedLookupValueByName(attributeName);
                break;
            case "optionset":
                this.addOnChange(attributeName, () =>
                    this.setSectionVisiblityToSelectedOptionSetValueByName(attributeName),
                );
                this.setSectionVisiblityToSelectedOptionSetValueByName(attributeName);
                break;
            default:
                throw new Error(
                    `ExtendedContext.syncSectionVisibilityToSelectedValueByName(): Attribute type "${att.getAttributeType()}" is not supported.`,
                );
        }
    }

    private setSectionVisiblityToSelectedLookupValueByName(attributeName: string | undefined): void {
        if (!attributeName) {
            console.error("ExtendedContext.setSectionVisiblityToSelectedLookupValueByName(): No attributeName given!");
            throw new Error(
                "ExtendedContext.setSectionVisiblityToSelectedLookupValueByName(): No attributeName given!",
            );
        }
        // Hide old value
        const oldValue = this.syncedSectionPreviousValuesByNames[attributeName];
        if (oldValue) {
            this.setSectionsVisible(oldValue, false);
        }
        const text = this.getDisplayValue(attributeName);
        if (text) {
            this.setSectionsVisible(text, true);
        }
        this.syncedSectionPreviousValuesByNames[attributeName] = text;
    }

    private setSectionVisiblityToSelectedOptionSetValueByName(attributeName: string | undefined): void {
        if (!attributeName) {
            console.error("ExtendedContext.setSectionVisiblityToSelectedValueByName(): No attributeName given!");
            throw new Error("ExtendedContext.setSectionVisiblityToSelectedValueByName(): No attributeName given!");
        }
        // Hide Unselected
        const att = this.context.getAttribute(attributeName) as XdtXrm.OptionSetAttribute<any>;
        if (!att) {
            return;
        }
        for (const option of att.getOptions()) {
            this.setSectionsVisible(option.text, false);
        }

        const text = this.getDisplayValue(att.getName());
        this.setSectionsVisible(text, true);
    }

    private setSectionsVisible(label: string, visible: boolean): void {
        this.context.ui.tabs.forEach((t) => {
            t.sections
                .get((s) => {
                    return s.getLabel() === label;
                })
                .forEach((s) => s.setVisible(visible));
        });
    }
}
