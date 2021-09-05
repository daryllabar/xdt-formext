import { SectionContext } from "./section";

export class FormContext extends SectionContext {
    public setAllVisible(visible: boolean): void {
        (this.ui.tabs as XdtXrm.TabCollectionBase).forEach((t) => {
            t.setVisible(visible);
            t.sections.forEach((s) => {
                s.setVisible(visible);
                s.controls.forEach((c) => {
                    c.setVisible(visible);
                });
            });
        });
    }
}
