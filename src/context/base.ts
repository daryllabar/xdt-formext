export class ExtendedContextBase {
    public context: XdtXrm.BasicPage;
    public data: XdtXrm.DataModule<any>;
    public ui: XdtXrm.UiModule<any, any>;

    constructor(executionOrFormContext: XdtXrm.FormContext | XdtXrm.OnLoadEventContext) {
        this.context = (
            this.isEventContext(executionOrFormContext)
                ? executionOrFormContext.getFormContext()
                : executionOrFormContext
        ) as XdtXrm.BasicPage;
        this.data = this.context.data;
        this.ui = this.context.ui;
    }

    /**
     * Returns string with current page URL.
     */
    public getUrl(): string {
        return this.context.getUrl();
    }

    public getAttribute(delegate: (item: XdtXrm.Attribute<any>, index?: number) => boolean): XdtXrm.Attribute<any>[];
    public getAttribute(attributeName: string): XdtXrm.Attribute<any> | undefined;
    public getAttribute(
        attributeName: string | ((item: XdtXrm.Attribute<any>, index?: number) => boolean),
    ): XdtXrm.Attribute<any> | XdtXrm.Attribute<any>[] | undefined {
        if (typeof attributeName === "function") {
            return (this.context as any).getAttribute(attributeName);
        }
        if (!attributeName) {
            console.error("ExtendedContext.getAttribute(): No attributeName given!");
            throw new Error("ExtendedContext.getAttribute(): No attributeName given!");
        }
        const att = this.context.getAttribute(attributeName);
        if (!att) {
            console.warn(`ExtendedContext.getAttribute(): No attribute found with name ${attributeName}!`);
        }
        return att;
    }

    public getControl(delegate: (item: XdtXrm.AnyControl, index?: number) => boolean): XdtXrm.AnyControl[];
    public getControl(controlName: string): XdtXrm.AnyControl | undefined;
    public getControl(
        controlName: string | ((item: XdtXrm.AnyControl, index?: number) => boolean),
    ): XdtXrm.AnyControl | XdtXrm.AnyControl[] | undefined {
        if (typeof controlName === "function") {
            return (this.context as any).getControl(controlName);
        }
        if (!controlName) {
            console.error("ExtendedContext.getControl(): No controlName given!");
            throw new Error("ExtendedContext.getControl(): No controlName given!");
        }
        let ctrl = this.context.getControl(controlName);
        if (!ctrl) {
            const att = this.context.getAttribute(controlName);
            ctrl = att?.controls?.get(0) as XdtXrm.AnyControl;
            if (!ctrl) {
                console.warn(`ExtendedContext.getControl(): No control found with name "${controlName}"!`);
            }
        }
        return ctrl;
    }

    private isEventContext(e: XdtXrm.OnLoadEventContext | XdtXrm.PageBase<any, any, any>): e is XdtXrm.OnLoadEventContext {
        return !!(e as XdtXrm.OnLoadEventContext).getFormContext;
    }
}
