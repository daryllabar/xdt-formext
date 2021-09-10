/**
 * Interface for a generic XdtXrm.Page
 */
export interface GenericPageContext extends XdtXrm.PageBase<any, any, any> {
    /**
     * Generic getAttribute
     */
    getAttribute(attrName: string): XdtXrm.Attribute<any> | undefined;

    /**
     * Generic getControl
     */
    getControl(ctrlName: string): XdtXrm.AnyControl | undefined;
}
