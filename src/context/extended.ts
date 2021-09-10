import { FormContext } from "./form";
import { SetVisibleOptions } from "./safeControl";

export interface ExtendedFormContext<
    TFormAttributes extends XdtXrm.EmptyFormAttributes,
    TFromControls extends XdtXrm.EmptyFormControls,
> {
    /** Actual Xrm Form Context */
    context: XdtXrm.BasicPage;
    /**
     * Remove a message already displayed for a control.
     * @param attributeName Attribute or Control name to clear the notification for.
     * @param uniqueId Optional - The unique id of the notification to clear.  Defaults to "setNotification_" + attributeName
     */
    clearNotification(attributeName: TFormAttributes["All"] | TFromControls["All"], uniqueId?: string): boolean;

    /**
     * Causes the OnChange event to occur on the column so that any script associated to that event can execute.
     * @param attributeName The attribute name.
     */
    fireOnChange(attributeName: TFormAttributes["All"]): void;

    /**
     * Returns whether the control is disabled.
     * @param attributeName The attribute name.
     */
    getDisabled(attributeName: TFormAttributes["All"]): boolean;

    /**
     * Gets the text value for the current attribute value.
     * @param attributeName The attribute name.
     */
    getDisplayValue(attributeName: TFormAttributes["All"]): string;

    /**
     * Returns the label for the control.
     * @param attributeName The attribute or control name.
     */
    getLabel(attributeName: string): string;

    /**
     * Returns true if the attribute is required.
     * @param attributeName The attribute name.
     */
    getRequired(attributeName: TFormAttributes["All"]): boolean;

    /**
     * Gets all sections for the current form.
     */
    getSections(): XdtXrm.PageSection[];

    /**
     * Returns a string ("always" | "never" | "dirty") indicating when data from the attribute will be submitted when the record is saved.
     */
    getSubmitMode(attributeName: string): XdtXrm.AttributeSubmitMode;

    /**
     * Returns true if every contorl for the given attribute/control is visible.
     * @param attributeOrControl The attribute or control name.
     * @param includeHierarchyVisibility Optional - If true or not included, the visibility of the section and tab is considered as well.  If false, the section and tab is not considered when returning visibilty, only the control(s).
     */
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
