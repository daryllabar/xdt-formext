import { ExtendedContext, ExtendedFormContext } from "./context/extended";
import { FormContext } from "./context/form";
import { showAndLogError } from "./error";

export abstract class BaseForm<
    TFormContext extends XdtXrm.FormContext,
    TFormAttributes extends XdtXrm.EmptyFormAttributes,
    TFromControls extends XdtXrm.EmptyFormControls,
> {
    private static instance = new Map<string, BaseForm<any, any, any>>();

    static load<T>(
        executionContext: XdtXrm.OnLoadEventContext,
        type: new (context: XdtXrm.OnLoadEventContext) => T,
        formName?: string,
    ): void {
        let instance = this.instance.get(this.constructor.name);
        if (!instance) {
            instance = new type(executionContext) as unknown as BaseForm<any, any, any>;
            this.instance.set(this.constructor.name, instance);
        }
        instance.formName = formName || instance.formName;
        instance.onInitialLoad().catch((err) => {
            instance?.showAndLogError(`Error in onInitialLoad of ${this.constructor.name}`, err);
        });
    }

    /** Extended Form Context */
    public context: TFormContext & ExtendedFormContext<TFormAttributes, TFromControls>;
    public untypedContext: ExtendedContext;
    public formName: string;

    /**
     * Creates the Form
     * @param context The Context
     * @param formName ** Only used in unit testing ** - Sets the form Name
     */
    constructor(
        context: XdtXrm.OnLoadEventContext,
        formName = "No form name specified as second param in onLoad call!",
    ) {
        this.context = new ExtendedContext(context) as any;
        this.untypedContext = this.context as unknown as FormContext;
        this.formName = formName;
    }

    /**
     * Prevents issues of "this" not refering to the form when calling add on change.
     * @param attributeNames The name of names of attributes to add the on change event to.
     * @param handler The method to call on change.
     */
    addOnChange(
        attributeNames: TFormAttributes["All"] | TFormAttributes["All"][],
        handler: (context?: XdtXrm.ExecutionContext<XdtXrm.Attribute<any>, undefined>) => any,
    ): void {
        (this.context as any).addOnChange(
            attributeNames,
            (c: XdtXrm.ExecutionContext<XdtXrm.Attribute<any>, undefined> | undefined) => {
                handler.call(this, c);
            },
        );
    }

    showAndLogError(
        displayMessage: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        err: any,
        options?: Xrm.Navigation.ErrorDialogOptions,
    ): Xrm.Async.PromiseLike<any> {
        return showAndLogError(displayMessage, err, options);
    }

    abstract onInitialLoad(): Promise<void>;
}
