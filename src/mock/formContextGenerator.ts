import * as FS from "fs";
import * as Path from "path";
import { ControlMock, ItemCollectionMock, TabMock, XrmMockGenerator, XrmStaticMock } from "xrm-mock";

enum ParserState {
    PreNamespace,
    PreTabInterface,
    TabInterfaces,
    PostTabInterfaces,
    FormInterface,
    PostFormInterface,
}

type SectionConfig = { [index: string]: string[] } | Map<string, string[]>;
let _mock: XrmStaticMock;

export function initializeForm(formPath: string, controlsBySection?: SectionConfig): XrmStaticMock {
    readform(formPath, controlsBySection);
    return _mock;
}

export function readform(formPath: string, controlsBySection?: SectionConfig): void {
    const contents = FS.readFileSync(Path.resolve(__dirname, formPath)).toString();
    parse(contents.split(contents.indexOf("\r\n") ? "\r\n" : "\n"), controlsBySection);
}
type State = {
    controlsByName: Map<string, Xrm.Controls.Control>;
    controlsBySection: Map<string, string[]>;
    sectionByName: Map<string, Xrm.Controls.Section>;
    tab: TabMock;
};

function isMap(config: SectionConfig): config is Map<string, string[]> {
    const isNotMap =
        !config.clear ||
        !config.delete ||
        !config.forEach ||
        !config.get ||
        !config.has ||
        !config.set ||
        (config.size !== 0 && !config.size);
    return !isNotMap;
}

export function parse(contents: string[], controlsBySection?: SectionConfig): void {
    if (contents.length == 0) {
        return;
    }

    if (!controlsBySection || !isMap(controlsBySection)) {
        const map = new Map<string, string[]>();
        for (const section in controlsBySection) {
            map.set(section, controlsBySection[section]);
        }
        controlsBySection = map;
    }

    const state = {
        controlsByName: new Map<string, Xrm.Controls.Control>(),
        controlsBySection: controlsBySection || new Map<string, string[]>(),
        sectionByName: new Map<string, Xrm.Controls.Section>(),
    } as State;

    let parserState = ParserState.PreNamespace;
    for (const line of contents) {
        switch (parserState) {
            case ParserState.PreNamespace:
                if (line.startsWith("declare namespace ")) {
                    parseNamespace(line);
                    parserState = ParserState.PreTabInterface;
                }
                break;
            case ParserState.PreTabInterface:
                if (line.startsWith("      interface ")) {
                    parserState = ParserState.TabInterfaces;
                } else if (line.startsWith("    }")) {
                    parserState = ParserState.PostTabInterfaces;
                }
                parseTabInterfaceLine(line, state);
                break;
            case ParserState.TabInterfaces:
                if (line.startsWith("    }")) {
                    parserState = ParserState.PostTabInterfaces;
                }
                parseTabInterfaceLine(line, state);
                parseGetSectionLine(line, state);
                break;
            case ParserState.PostTabInterfaces:
                if (line.startsWith("  interface")) {
                    parserState = ParserState.FormInterface;
                    continue;
                }
                break;
            case ParserState.FormInterface:
                if (line.startsWith("  }")) {
                    parserState = ParserState.PostFormInterface;
                    continue;
                }

                parseGetAttributeLine(line, state);
                parseGetControlLine(line, state);

                break;
            case ParserState.PostFormInterface:
                break;
            default:
                throw new Error("Unknown State!");
        }
    }

    associateControlToSection(state);
}

function parseNamespace(line: string) {
    const parts = line.split("namespace Form.");
    if (parts.length !== 2) {
        _mock = XrmMockGenerator.initialise();
        return;
    }
    _mock = XrmMockGenerator.initialise({ entity: { entityName: parts[1].split(".")[0] } });
}

function parseTabInterfaceLine(line: string, state: State): void {
    if (!line.startsWith("      interface ")) {
        return;
    }
    const name = (line.match(/[^ ]+/g) || [])[1];
    state.tab = XrmMockGenerator.Tab.createTab(name);
}

function parseGetSectionLine(line: string, state: State): void {
    if (!line.startsWith('        get(name: "')) {
        return;
    }
    const name = line.split('"')[1];
    state.sectionByName.set(
        name,
        XrmMockGenerator.Section.createSection(name, undefined, undefined, state.tab, new ItemCollectionMock()),
    );
}

function parseGetAttributeLine(line: string, state: State): void {
    if (!line.startsWith('    getAttribute(attributeName: "')) {
        return;
    }

    let att: Xrm.Attributes.Attribute | undefined = undefined;
    const name = line.split('"')[1];
    const fullType = line.split(":")[2];
    let type = fullType.split("<")[0];
    type = type.substr(type.indexOf(".") + 1).split(";")[0];
    if (fullType.split(".")[1] === "Attribute<any>;") {
        if (name.length > 6 && name.substring(0, 6) === "record") {
            type = "LookupAttribute";
        } else {
            type = "Attribute";
        }
    }
    switch (type) {
        case "Attribute":
            att = XrmMockGenerator.Attribute.createString(name) as any;
            break;
        case "DateAttribute":
            att = XrmMockGenerator.Attribute.createDate(name) as any;
            break;
        case "LookupAttribute":
            att = XrmMockGenerator.Attribute.createLookup(name, []) as any;
            break;
        case "MultiSelectOptionSetAttribute":
        case "OptionSetAttribute":
            att = XrmMockGenerator.Attribute.createOptionSet(name) as any;
            break;
        case "NumberAttribute":
            att = XrmMockGenerator.Attribute.createNumber(name) as any;
            break;
        default:
            break;
    }
    if (att) {
        state.controlsByName.set(att.getName(), att.controls.get()[0]);
    }
}

function parseGetControlLine(line: string, state: State): void {
    if (!line.startsWith('    getControl(controlName: "')) {
        return;
    }

    const name = line.split('"')[1];

    const att = XrmMockGenerator.getFormContext().getAttribute(name);
    if (att) {
        // Attribute/Control have same name, exit
        return;
    }

    const fullType = line.split(":")[2];
    let type = fullType.split("<")[0];
    type = type.substr(type.indexOf(".") + 1).split(";")[0];
    if (name.startsWith("footer_") || name.startsWith("header_")) {
        let control = undefined as Xrm.Controls.Control | undefined;
        const attForControl = GetAttributeForControl(name);
        if (attForControl) {
            switch (type) {
                case "StringControl":
                    control = XrmMockGenerator.Control.createString(attForControl, name);
                    break;
                case "DateControl":
                    control = XrmMockGenerator.Control.createDate(attForControl, name);
                    break;
                case "Control":
                case "LookupControl":
                    control = XrmMockGenerator.Control.createLookup(attForControl, name);
                    break;
                case "MultiSelectOptionSetControl":
                case "OptionSetControl":
                    control = XrmMockGenerator.Control.createOptionSet(attForControl, name);
                    break;
                case "NumberControl":
                    control = XrmMockGenerator.Control.createNumber(attForControl, name);
                    break;
                default:
                    break;
            }
        } else {
            console.warn(`Unable to create the control "${name}" because no attribute was found!`);
        }
        if (control) {
            state.controlsByName.set(control.getName(), control);
        }
    }
}

function GetAttributeForControl(name: string): any {
    name = name.startsWith("header_process_") ? name.substr(15) : name.substr(7);
    let att = XrmMockGenerator.formContext.getAttribute(name);
    if (!att && name.indexOf("_") > 0) {
        const index = name.lastIndexOf("_");
        if (!isNaN(Number(name.substr(index + 1)))) {
            att = XrmMockGenerator.formContext.getAttribute(name.substr(0, index));
        }
    }
    return att;
}

function associateControlToSection(state: State) {
    state.controlsBySection.forEach((controlNames, sectionName) => {
        const section = state.sectionByName.get(sectionName);
        if (!section) {
            throw new Error("No Section found for name: " + sectionName);
        }
        for (const controlName of controlNames) {
            const control = state.controlsByName.get(controlName) as ControlMock;
            if (!control) {
                throw new Error("No Control found for name: " + controlName);
            }
            if (!section.controls) {
                section.controls = new ItemCollectionMock<Xrm.Controls.Control>();
            }
            (section.controls as ItemCollectionMock<Xrm.Controls.Control>).push(control);
            control.parent = section;
        }
    });
}
