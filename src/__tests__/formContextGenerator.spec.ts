import { XrmMockGenerator } from "xrm-mock";
import * as MockGen from "../mock/formContextGenerator";

describe("FormContextGenerator", () => {
    const _prefixes = ["Xrm", "XdtXrm"];
    it("should parse every attribute type", () => {
        const attributes = {
            any_att: "string", // Not sure
            record1: "lookup",
            date_att: "datetime",
            lookup_att: "lookup",
            msos_att: "optionset",
            multilookup_att: "lookup",
            number_att: "decimal",
            os_att: "optionset",
            string_att: "string",
        } as { [index: string]: string };
        for (const prefix of _prefixes) {
            XrmMockGenerator.initialise();
            MockGen.parse(getAllAttributesForm(prefix));
            const context = XrmMockGenerator.getFormContext();
            for (const att in attributes) {
                const formAtt = context.getAttribute(att);
                expect(formAtt ? null : `Attribute "${att}" was not generated!`).toBeNull();
                expect(formAtt.getName()).toBe(att);
                expect(formAtt.getAttributeType()).toBe(attributes[att]);
            }
        }
    });

    it("should parse every control type", () => {
        const controls = {
            any_att: { type: "standard" }, // Not sure
            record1: { type: "lookup" },
            date_att: { type: "standard" },
            lookup_att: { type: "lookup" },
            msos_att: { type: "optionset" },
            multilookup_att: { type: "lookup" },
            number_att: { type: "standard" },
            os_att: { type: "optionset" },
            string_att: { type: "standard" },
            footer_string_att: { att: "string_att", type: "standard" },
            header_string_att: { att: "string_att", type: "standard" },
        } as { [index: string]: { att?: string; type: string } };
        for (const prefix of _prefixes) {
            XrmMockGenerator.initialise();
            MockGen.parse(getAllAttributesForm(prefix));
            const context = XrmMockGenerator.getFormContext();
            for (const ctrl in controls) {
                const info = controls[ctrl];
                const formControl = context.getControl(ctrl) as Xrm.Controls.StandardControl;
                expect(formControl ? null : `Control "${ctrl}" was not generated!`).toBeNull();
                expect(formControl.getName()).toBe(ctrl);
                expect(formControl.getAttribute().getName()).toBe(info.att || ctrl);
                expect(formControl.getControlType()).toBe(info.type);
            }
        }
    });

    it("should parse all sections/tabs", () => {
        for (const prefix of _prefixes) {
            XrmMockGenerator.initialise();
            MockGen.parse(getAllAttributesForm(prefix));
            const context = XrmMockGenerator.getFormContext();
            expect(context.ui.tabs.getLength()).toBe(2);
            const tab1 = context.ui.tabs.get("Tab1Name");
            expect(tab1 ? null : 'Tab "Tab1Name" was not found!').toBeNull();
            expect(tab1.sections.getLength()).toBe(1);
            expect(tab1.sections.get("sectionName") ? null : 'Section "sectionName" was not found!').toBeNull();
            const tab2 = context.ui.tabs.get("Tab2Name");
            expect(tab2 ? null : 'Tab "Tab2Name" was not found!').toBeNull();
            expect(tab2.sections.getLength()).toBe(2);
            expect(tab2.sections.get("sectionAName") ? null : 'Section "sectionAName" was not found!').toBeNull();
            expect(tab2.sections.get("sectionBName") ? null : 'Section "sectionBName" was not found!').toBeNull();
        }
    });

    it("should add controls to sections", () => {
        for (const prefix of _prefixes) {
            XrmMockGenerator.initialise();
            MockGen.parse(
                getAllAttributesForm(prefix),
                new Map([
                    ["sectionName", ["any_att"]],
                    ["sectionAName", ["number_att", "os_att"]],
                ]),
            );
            const context = XrmMockGenerator.getFormContext();
            const sectionName = context.ui.tabs.get("Tab1Name").sections.get("sectionName");
            expect(sectionName.controls.getLength()).toBe(1);
            expect(sectionName.controls.get()[0].getName()).toBe("any_att");
            const sectionA = context.ui.tabs.get("Tab2Name").sections.get("sectionAName");
            expect(sectionA.controls.getLength()).toBe(2);
            expect(sectionA.controls.get("number_att")).not.toBeNull();
            expect(sectionA.controls.get("os_att")).not.toBeNull();
        }
    });
});

function getAllAttributesForm(prefix: string): string[] {
    // eslint-disable-next-line prettier/prettier
    return `declare namespace Form.unitTest.Main {
  namespace FormName {
    namespace Tabs {
      interface Tab1Name extends ${prefix}.SectionCollectionBase {
        get(name: "sectionName"): ${prefix}.PageSection;
        get(name: string): undefined;
        get(): ${prefix}.PageSection[];
        get(index: number): ${prefix}.PageSection;
        get(chooser: (item: ${prefix}.PageSection, index: number) => boolean): ${prefix}.PageSection[];
      }
      interface Tab2Name extends ${prefix}.SectionCollectionBase { 
        get(name: "sectionAName"): ${prefix}.PageSection;
        get(name: "sectionBName"): ${prefix}.PageSection; 
        get(name: string): undefined;
        get(): ${prefix}.PageSection[];
        get(index: number): ${prefix}.PageSection;
        get(chooser: (item: ${prefix}.PageSection, index: number) => boolean): ${prefix}.PageSection[];
      }
    }
    interface Attributes extends ${prefix}.AttributeCollectionBase {
      get(name: "any_att"): ${prefix}.Attribute<any>;
      get(name: "record1"): ${prefix}.Attribute<any>;
      get(name: "date_att"): ${prefix}.DateAttribute;
      get(name: "lookup_att"): ${prefix}.LookupAttribute<"entity1">;
      get(name: "msos_att"): ${prefix}.MultiSelectOptionSetAttribute<msos_enum>;
      get(name: "multilookup_att"): ${prefix}.LookupAttribute<"entity1" | "entity2">;
      get(name: "number_att"): ${prefix}.NumberAttribute;
      get(name: "os_att"): ${prefix}.OptionSetAttribute<os_enum>;
      get(name: "string_att"): ${prefix}.Attribute<string>;
      get(name: string): undefined;
      get(): ${prefix}.Attribute<any>[];
      get(index: number): ${prefix}.Attribute<any>;
      get(chooser: (item: ${prefix}.Attribute<any>, index: number) => boolean): ${prefix}.Attribute<any>[];
    }
    interface Controls extends ${prefix}.ControlCollectionBase {
      get(name: "any_att"): ${prefix}.Control<${prefix}.Attribute<any>>;
      get(name: "record1"): ${prefix}.Control<${prefix}.Attribute<any>>;
      get(name: "date_att"): ${prefix}.DateControl;
      get(name: "lookup_att"): ${prefix}.LookupControl<"entity1">;
      get(name: "msos_att"): ${prefix}.MultiSelectOptionSetControl<msos_enum>;
      get(name: "multilookup_att"): ${prefix}.LookupControl<"entity1" | "entity2">;
      get(name: "number_att"): ${prefix}.NumberControl;
      get(name: "os_att"): ${prefix}.OptionSetControl<os_enum>;
      get(name: "string_att"): ${prefix}.StringControl;    
      get(name: "footer_string_att"): ${prefix}.StringControl;
      get(name: "header_string_att"): ${prefix}.StringControl;
      get(name: string): undefined;
      get(): ${prefix}.BaseControl[];
      get(index: number): ${prefix}.BaseControl;
      get(chooser: (item: ${prefix}.BaseControl, index: number) => boolean): ${prefix}.BaseControl[];
    }
    interface Tabs extends ${prefix}.TabCollectionBase {
      get(name: "TabName"): ${prefix}.PageTab<Tabs.TabName>;
      get(name: "Tab2Name"): ${prefix}.PageTab<Tabs.TabName>;
      get(name: string): undefined;
      get(): ${prefix}.PageTab<${prefix}.Collection<${prefix}.PageSection>>[];
      get(index: number): ${prefix}.PageTab<${prefix}.Collection<${prefix}.PageSection>>;
      get(chooser: (item: ${prefix}.PageTab<${prefix}.Collection<${prefix}.PageSection>>, index: number) => boolean): ${prefix}.PageTab<${prefix}.Collection<${prefix}.PageSection>>[];
    }
  }
  interface FormName extends ${prefix}.PageBase<FormName.Attributes,FormName.Tabs,FormName.Controls> {
    getAttribute(attributeName: "any_att"): ${prefix}.Attribute<any>;
    getAttribute(attributeName: "record1"): ${prefix}.Attribute<any>;
    getAttribute(attributeName: "date_att"): ${prefix}.DateAttribute;
    getAttribute(attributeName: "lookup_att"): ${prefix}.LookupAttribute<"entity1">;
    getAttribute(attributeName: "msos_att"): ${prefix}.MultiSelectOptionSetAttribute<msos_enum>;
    getAttribute(attributeName: "multilookup_att"): ${prefix}.LookupAttribute<"entity1" | "entity2">;
    getAttribute(attributeName: "number_att"): ${prefix}.NumberAttribute;
    getAttribute(attributeName: "os_att"): ${prefix}.OptionSetAttribute<os_enum>;
    getAttribute(attributeName: "string_att"): ${prefix}.Attribute<string>;
    getAttribute(attributeName: string): undefined;
    getControl(controlName: "any_att"): ${prefix}.Control<${prefix}.Attribute<any>>;
    getControl(controlName: "record1"): ${prefix}.Control<${prefix}.Attribute<any>>;
    getControl(controlName: "date_att"): ${prefix}.DateControl;
    getControl(controlName: "lookup_att"): ${prefix}.LookupControl<"entity1">;
    getControl(controlName: "msos_att"): ${prefix}.MultiSelectOptionSetControl<msos_enum>;
    getControl(controlName: "multilookup_att"): ${prefix}.LookupControl<"entity1" | "entity2">;
    getControl(controlName: "number_att"): ${prefix}.NumberControl;
    getControl(controlName: "os_att"): ${prefix}.OptionSetControl<os_enum>;
    getControl(controlName: "string_att"): ${prefix}.StringControl;    
    getControl(controlName: "footer_string_att"): ${prefix}.StringControl;
    getControl(controlName: "header_string_att"): ${prefix}.StringControl;
    getControl(controlName: string): undefined;
  }
}`.split("\n");
}
