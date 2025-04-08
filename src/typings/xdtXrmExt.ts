// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-namespace
declare namespace XdtXrmToBeInjectedViaXdtPostProcessor {
    export type EmptyFormAttributes = FormAttributesBase<
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
    >;
    export type EmptyFormControls = FormControlsBase<
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string,
        string
    >;

    export type FormAttributesBase<
        TAll extends string,
        TBoolean extends string,
        TDate extends string,
        TLookup extends string,
        TMultiSelect extends string,
        TNumber extends string,
        TOptionSet extends string,
        TString extends string,
    > = {
        All: TAll;
        Boolean: TBoolean;
        Date: TDate;
        Lookup: TLookup;
        MultiSelect: TMultiSelect;
        Number: TNumber;
        OptionSet: TOptionSet;
        String: TString;
    };

    export type FormControlsBase<
        TAll extends string,
        TAttributeControl extends string,
        TBaseControl extends string,
        TBooleanControl extends string,
        TDateControl extends string,
        TIFrame extends string,
        TKbSearch extends string,
        TLookup extends string,
        TMultiSelect extends string,
        TNumberControl extends string,
        TOptionSetControl extends string,
        TStringControl extends string,
        TSubgrid extends string,
        TWebResource extends string,
    > = {
        All: TAll;
        AttributeControl: TAttributeControl;
        BaseControl: TBaseControl;
        BooleanControl: TBooleanControl;
        DateControl: TDateControl;
        IFrame: TIFrame;
        KbSearch: TKbSearch;
        Lookup: TLookup;
        MultiSelect: TMultiSelect;
        NumberControl: TNumberControl;
        OptionSetControl: TOptionSetControl;
        StringControl: TStringControl;
        Subgrid: TSubgrid;
        WebResource: TWebResource;
    };

    /**
     * Interface for a generic XdtXrm.Page
     */
    export interface FormContext extends XdtXrm.PageBase<any, any, any> {
        /**
         * Generic getAttribute
         */
        getAttribute(attrName: string): XdtXrm.Attribute<any> | undefined;

        /**
         * Generic getControl
         */
        getControl(ctrlName: string): XdtXrm.AnyControl | undefined;
    }

    export interface BaseExecutionContext extends XdtXrm.ExecutionContext<any, any> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getFormContext<T extends XdtXrm.PageBase<any, any, any>>(): T;
    }
}
