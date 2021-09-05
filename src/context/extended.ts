import { FormContext } from "./form";
import { SetVisibleOptions } from "./safeControl";

export interface ExtendedFormContext<
    TFormAttributes extends XdtXrm.EmptyFormAttributes,
    TFromControls extends XdtXrm.EmptyFormControls,
> {
    /** Actual Xrm Form Context */
    context: XdtXrm.BasicPage;
    clearNotification(attributeName: TFormAttributes["All"] | TFromControls["All"], uniqueId?: string): boolean;
    fireOnChange(attributeName: TFormAttributes["All"]): void;
    getDisabled(attributeName: TFormAttributes["All"]): boolean;
    getDisplayValue(attributeName: TFormAttributes["All"]): string;
    getLabel(attributeName: string): string;
    getRequired(attributeName: TFormAttributes["All"]): boolean;
    getSections(): XdtXrm.PageSection[];
    getSubmitMode(attributeName: string): XdtXrm.AttributeSubmitMode;
    getVisible(
        attributeOrControl: TFormAttributes["All"] | TFromControls["All"],
        includeHierarchyVisibility?: boolean,
    ): boolean;
    initializeFormattedValue(
        attributeName: TFormAttributes["String"],
        format: string,
        ...args: TFormAttributes["All"][]
    ): void;
    removeOnChange(
        attributeName: TFormAttributes["All"] | TFormAttributes["All"][],
        handler: (context?: XdtXrm.ExecutionContext<XdtXrm.Attribute<any>, undefined>) => any,
    ): void;
    setAllVisible(visible: boolean): void;
    setDisabled(attributeName: TFormAttributes["All"], visible: boolean): void;
    setFocus(attributeName: TFormAttributes["All"] | TFromControls["All"]): void;
    setLabel(attributeName: string, text: string): void;
    setNotification(
        attributeName: TFormAttributes["All"] | TFromControls["All"],
        message: string,
        uniqueId?: string,
    ): boolean;
    setRequired(attributeName: TFormAttributes["All"], required?: boolean): void;
    setSubmitMode(attributeName: string | string[], submitMode: boolean | XdtXrm.AttributeSubmitMode): void;
    setValue(
        attributeName: TFormAttributes["Lookup"],
        id: string,
        entityType: string,
        name: string,
        fireOnChange?: boolean,
    ): void;
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
    setVisible(
        name: TFormAttributes["All"] | TFromControls["All"],
        visible?: boolean,
        options?: SetVisibleOptions,
    ): void;
    /**
     * When a value is selected, will show all sections with the same label as the display value selected.
     * When a value is deselected, will hide all sections with the same label as the display value no longer selected.
     * @param name OptionSet or Lookup Attribute Name to use the display values to sync sections with
     */
    syncSectionVisibilityToSelectedValueByName(name: TFormAttributes["OptionSet"] | TFormAttributes["Lookup"]): void;
}

export class ExtendedContext extends FormContext {}
