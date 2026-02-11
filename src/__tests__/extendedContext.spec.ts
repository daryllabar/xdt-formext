import { ItemCollectionMock, XrmMockGenerator } from "xrm-mock";
import { ExtendedContext } from "../context/extended";

describe("ExtendedContexts Tests", () => {
    let _sut: FormExt.contact.Main.Information & ExtendedContext;
    const _account: XdtXrm.EntityReference<"account"> = {
        id: "AccountIdGuid",
        entityType: "account",
        name: "Acme",
    };
    const _account2: XdtXrm.EntityReference<"account"> = {
        id: "AccountIdGuid2",
        entityType: "account",
    };
    beforeEach(() => {
        XrmMockGenerator.initialise();
        const form = XrmMockGenerator.Attribute;
        form.createLookup("parentaccountid" as FormExt.contact.Main.Information.AccountLookupAttributeNames, []);
        form.createOptionSet("address1_freighttermscode", 1, [
            {
                text: "FOB",
                value: contact_address1_freighttermscode.FOB,
            },
            {
                text: "No Charge",
                value: contact_address1_freighttermscode.NoCharge,
            },
        ]);
        form.createString(
            {
                name: "lastname" as FormExt.contact.Main.Information.StringAttributeNames,
            },
            [
                {
                    name: "lastname",
                },
                {
                    name: "header_lastname",
                },
            ],
        );
        const section = XrmMockGenerator.Section.createSection(
            "lastNameSection",
            "No Charge",
            true,
            XrmMockGenerator.Tab.createTab("MainTab", undefined, true),
            new ItemCollectionMock(XrmMockGenerator.getFormContext().getControl()),
        );
        form.createString(
            {
                name: "theattribute",
            },
            {
                name: "thecontrol",
                parent: section,
            },
        );

        _sut = new ExtendedContext(XrmMockGenerator.getFormContext() as any) as any;
    });
    describe("addOnChange", () => {
        test("for single attribute SHOULD addOnChange", () => {
            const onChange = jest.fn();

            _sut.addOnChange("lastname", onChange);

            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
        });
        test("for multiple attributes SHOULD addOnChange", () => {
            const onChange = jest.fn();

            _sut.addOnChange(["lastname", "parentaccountid"], onChange);
            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
            _sut.setValue("parentaccountid", _account);
            expect(onChange).toBeCalledTimes(2);
        });
    });
    describe("clearNotification", () => {
        it("SHOULD call clearNotification", () => {
            const spy = jest.fn();
            (_sut.context.getControl("parentaccountid") as any).clearNotification = spy;
            _sut.clearNotification("parentaccountid", "id");
            expect(spy).toBeCalledWith("id");

            _sut.clearNotification("parentaccountid");
            expect(spy).toBeCalledWith("setNotification_parentaccountid");
        });
    });
    describe("fireOnChange", () => {
        test("on call SHOULD fire onChange handler", () => {
            const onChange = jest.fn();

            _sut.addOnChange("lastname", onChange);
            _sut.fireOnChange("lastname");
            expect(onChange).toBeCalledTimes(1);
        });
    });
    describe("getControl", () => {
        test("with Attribute name SHOULD return control", () => {
            const ctrl = _sut.getControl("theattribute") as unknown as XdtXrm.AnyControl;
            expect(ctrl).not.toBeNull();
            expect(ctrl.getName()).toBe("thecontrol");
        });
    });
    describe("getDisplayValue", () => {
        test("for multiple attribute types SHOULD return text value", () => {
            expect(_sut.getDisplayValue("parentaccountid")).toBe("");
            _sut.setValue("parentaccountid", { id: "1", entityType: "account", name: "HOWDY" });
            expect(_sut.getDisplayValue("parentaccountid")).toBe("HOWDY");
            expect(_sut.getDisplayValue("lastname")).toBe("");
            _sut.setValue("lastname", "Jones");
            expect(_sut.getDisplayValue("lastname")).toBe("Jones");
            expect(_sut.getDisplayValue("address1_freighttermscode")).toBe("FOB");
            _sut.setValue("address1_freighttermscode", contact_address1_freighttermscode.NoCharge);
            expect(_sut.getDisplayValue("address1_freighttermscode")).toBe("No Charge");
        });
    });
    describe("getDisabled", () => {
        it("SHOULD return if disabled", () => {
            _sut.getAttribute("lastname")?.controls.forEach((c) => c.setDisabled(true));
            expect(_sut.getDisabled("lastname")).toBe(true);

            _sut.getAttribute("lastname")?.controls.forEach((c) => c.setDisabled(false));
            expect(_sut.getDisabled("lastname")).toBe(false);
        });
    });
    describe("getLabel", () => {
        it("SHOULD return label text", () => {
            _sut.getAttribute("lastname")?.controls.forEach((c) => c.setLabel(c.getName()));
            expect(_sut.getLabel("lastname")).toBe("lastname");
            expect(_sut.getLabel("header_lastname")).toBe("header_lastname");
        });
    });
    describe("getRequired", () => {
        it("SHOULD return attribute requirement level", () => {
            _sut.setRequired("lastname");
            expect(_sut.getRequired("lastname")).toBe(true);

            _sut.setRequired("lastname", false);
            expect(_sut.getRequired("lastname")).toBe(false);
        });
    });
    describe("getSubmitMode", () => {
        it("SHOULD return attribute submit mode", () => {
            _sut.setSubmitMode("lastname");
            expect(_sut.getSubmitMode("lastname")).toBe("always");

            _sut.setSubmitMode("lastname", false);
            expect(_sut.getSubmitMode("lastname")).toBe("never");
        });
    });
    describe("getValue", () => {
        test("empty lookup attribute SHOULD return null", () => {
            expect(_sut.getValue("parentaccountid")).toBeNull();
        });
        test("single reference lookup attribute SHOULD return lookup", () => {
            _sut.getAttribute("parentaccountid")?.setValue([_account]);
            const value = _sut.getValue("parentaccountid");
            expect(value).not.toBeNull();
            expect(value?.id).toBe(_account.id);
        });
        test("multiple reference lookup attribute SHOULD return first item", () => {
            _sut.getAttribute("parentaccountid")?.setValue([_account, _account2]);
            const value = _sut.getValue("parentaccountid");
            expect(Array.isArray(value)).toBe(false);
            expect(value?.id).toBe(_account.id);
        });
    });
    describe("getVisible", () => {
        beforeEach(() => {
            _sut.context.ui.tabs.forEach((t) => {
                t.setVisible(true);
                t.sections.forEach((s) => {
                    s.setVisible(true);
                });
            });
        });

        test("attribute name not matching control SHOULD get visibility", () => {
            const ctrl = _sut.getControl("thecontrol") as unknown as XdtXrm.AnyControl;
            expect(ctrl.getVisible()).toBe(true);
            expect(_sut.getVisible("theattribute" as any)).toBe(true);
            _sut.setVisible("theattribute" as any, false);
            expect(ctrl.getVisible()).toBe(false);
            expect(_sut.getVisible("theattribute" as any)).toBe(false);
        });

        test("multiple controls SHOULD or visibility", () => {
            const ctrl1 = _sut.context.getControl("lastname") as unknown as XdtXrm.AnyControl;
            const ctrl2 = _sut.context.getControl("header_lastname") as unknown as XdtXrm.AnyControl;
            expect(ctrl1.getVisible()).toBe(true);
            expect(ctrl2.getVisible()).toBe(true);
            expect(_sut.getVisible("lastname")).toBe(true);
            ctrl1.setVisible(false);
            expect(_sut.getVisible("lastname")).toBe(true);
            ctrl2.setVisible(false);
            expect(_sut.getVisible("lastname")).toBe(false);
        });

        test("hierarchy SHOULD be honored", () => {
            const ctrl1 = _sut.context.getControl("lastname") as unknown as XdtXrm.AnyControl;
            const section = ctrl1.getParent();
            const tab = section.getParent();
            expect(ctrl1.getVisible()).toBe(true);
            expect(section.getVisible()).toBe(true);
            expect(tab.getVisible()).toBe(true);
            expect(_sut.getVisible("lastname")).toBe(true);
            // Test Tab Visibility
            tab.setVisible(false);
            expect(_sut.getVisible("lastname")).toBe(false);
            expect(_sut.getVisible("lastname", false)).toBe(true);
            tab.setVisible(true);
            expect(_sut.getVisible("lastname")).toBe(true);
            // Test Section visibility
            section.setVisible(false);
            expect(_sut.getVisible("lastname")).toBe(false);
            expect(_sut.getVisible("lastname", false)).toBe(true);
            section.setVisible(true);
            expect(_sut.getVisible("lastname")).toBe(true);
        });
    });
    describe("removeOnChange", () => {
        test("for single attribute SHOULD remove handler", () => {
            const onChange = jest.fn();
            _sut.addOnChange("lastname", onChange);
            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
            _sut.removeOnChange("lastname", onChange);
            _sut.setValue("lastname", "abc");
            expect(onChange).toBeCalledTimes(1);
        });
        test("for multiple attributes SHOULD remove handler", () => {
            const onChange = jest.fn();

            _sut.addOnChange(["lastname", "parentaccountid"], onChange);
            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
            _sut.setValue("parentaccountid", _account);
            expect(onChange).toBeCalledTimes(2);

            _sut.removeOnChange(["lastname", "parentaccountid"], onChange);
            _sut.setValue("lastname", "abc");
            expect(onChange).toBeCalledTimes(2);
            _sut.setValue("parentaccountid", _account2);
            expect(onChange).toBeCalledTimes(2);
        });
    });
    describe("setAllVisible", () => {
        it("SHOULD set all control visibility", () => {
            const expectAllVisible = (visible: boolean): void => {
                (_sut.ui.tabs as XdtXrm.TabCollectionBase).forEach((t) => {
                    expect(t.getVisible()).toBe(visible);
                    t.sections.forEach((s) => {
                        expect(s.getVisible()).toBe(visible);
                        s.controls.forEach((c) => {
                            expect(c.getVisible()).toBe(visible);
                        });
                    });
                });
            };

            _sut.setAllVisible(true);
            expectAllVisible(true);
            _sut.setAllVisible(false);
            expectAllVisible(false);
            _sut.setAllVisible(true);
            expectAllVisible(true);
        });
    });
    describe("setDisabled", () => {
        it("SHOULD disabled/enable control", () => {
            _sut.setDisabled("lastname");
            expect(_sut.getDisabled("lastname")).toBe(true);

            _sut.setDisabled("lastname", false);
            expect(_sut.getDisabled("lastname")).toBe(false);
        });
    });
    describe("setFocus", () => {
        it("SHOULD call setFocus on the control", () => {
            const spy = jest.fn();
            (_sut.getControl("lastname") as any).setFocus = spy;
            _sut.setFocus("lastname");
            expect(spy).toBeCalledTimes(1);
        });
    });
    describe("setLabel", () => {
        it("SHOULD set label text", () => {
            const text = "Last Name";
            _sut.setLabel("lastname", text);
            expect(_sut.context.getControl("lastname")?.getLabel()).toBe(text);
            expect(_sut.context.getControl("header_lastname")?.getLabel()).toBe(text);
        });
    });
    describe("setNotification", () => {
        it("SHOULD call setNotification", () => {
            const msg = "Hello World!";
            const spy = jest.fn();
            (_sut.context.getControl("parentaccountid") as any).setNotification = spy;
            _sut.setNotification("parentaccountid", msg, "id");
            expect(spy).toBeCalledWith(msg, "id");

            _sut.setNotification("parentaccountid", msg + 2);
            expect(spy).toBeCalledWith(msg + 2, "setNotification_parentaccountid");
        });
    });
    describe("setRequired", () => {
        test("for single attribute SHOULD setRequired", () => {
            _sut.setRequired("lastname");
            expect(_sut.getAttribute("lastname")?.getRequiredLevel()).toBe("required");

            _sut.setRequired("lastname", false);
            expect(_sut.getAttribute("lastname")?.getRequiredLevel()).toBe("none");
        });

        test("for mulitiple attributes SHOULD setRequired", () => {
            const atts = ["lastname", "parentaccountid"];
            _sut.setRequired(atts);
            for (const att of atts) {
                expect(_sut.context.getAttribute(att)?.getRequiredLevel()).toBe("required");
            }

            _sut.setRequired(atts, false);
            for (const att of atts) {
                expect(_sut.context.getAttribute(att)?.getRequiredLevel()).toBe("none");
            }

            _sut.setRequired(atts);
            for (const att of atts) {
                expect(_sut.context.getAttribute(att)?.getRequiredLevel()).toBe("required");
            }
        });
    });
    describe("setSubmitMode", () => {
        test("set true/false SHOULD set submit mode to always/none", () => {
            const spy = jest.fn();
            const att = _sut.getAttribute("lastname") as any;
            att.setSubmitMode = spy;
            _sut.setSubmitMode("lastname");
            expect(spy).toBeCalledWith("always");
            _sut.setSubmitMode("lastname", false);
            expect(spy).toBeCalledWith("never");
        });
        test("set array SHOULD set submit mode for multiple", () => {
            const spy1 = jest.fn();
            const spy2 = jest.fn();
            (_sut.getAttribute("lastname") as any).setSubmitMode = spy1;
            (_sut.getAttribute("parentaccountid") as any).setSubmitMode = spy2;
            _sut.setSubmitMode(["lastname", "parentaccountid"]);
            expect(spy1).toBeCalledWith("always");
            expect(spy2).toBeCalledWith("always");
        });
        it("SHOULD call setSubmitMode", () => {
            const spy = jest.fn();
            const att = _sut.getAttribute("lastname") as any;
            att.setSubmitMode = spy;
            const modes: XdtXrm.AttributeSubmitMode[] = ["always", "dirty", "never"];
            for (const mode of modes) {
                _sut.setSubmitMode("lastname", mode);
                expect(spy).toBeCalledWith(mode);
            }
        });
    });
    describe("setValue", () => {
        test("set null lookup SHOULD set null", () => {
            const att = _sut.getAttribute("parentaccountid");
            att?.setValue([_account]);
            _sut.setValue("parentaccountid", null);
            expect(att?.getValue()).toStrictEqual(null);
        });
        test("set value lookup SHOULD set array", () => {
            const att = _sut.getAttribute("parentaccountid");
            _sut.setValue("parentaccountid", _account);
            const value = att?.getValue() || [];
            expect(value.length).toBe(1);
            expect(value[0]).toStrictEqual(_account);
        });
        test("set array value SHOULD set array", () => {
            const att = _sut.getAttribute("parentaccountid");
            (_sut as any).setValue("parentaccountid", [_account, _account2]);
            const value = att?.getValue() || [];
            expect(value.length).toBe(2);
            expect(value[0]).toStrictEqual(_account);
            expect(value[1]).toStrictEqual(_account2);
        });
        test("set lookup overload SHOULD set array", () => {
            const att = _sut.getAttribute("parentaccountid");
            _sut.setValue("parentaccountid", _account.id, _account.entityType, _account.name || "");
            const value = att?.getValue() || [];
            expect(value.length).toBe(1);
            expect(value[0]).toStrictEqual(_account);
        });
        test("set text SHOULD fire onChange if different", () => {
            const onChange = jest.fn();
            _sut.addOnChange("lastname", onChange);
            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
            _sut.setValue("lastname", "123");
            expect(onChange).toBeCalledTimes(1);
        });
        test("set lookup SHOULD fire onChange if different", () => {
            const onChange = jest.fn();
            _sut.addOnChange("parentaccountid", onChange);
            _sut.setValue("parentaccountid", _account);
            expect(onChange).toBeCalledTimes(1);
            _sut.setValue("parentaccountid", _account);
            expect(onChange).toBeCalledTimes(1);
        });
    });
    describe("setVisible", () => {
        const expectLastNameRequired = (required: boolean): void => {
            expect(_sut.getRequired("lastname")).toBe(required);
        };

        const expectVisible = (
            visible: boolean,
            ...controls: { getVisible: () => boolean; getName: () => string }[]
        ): void => {
            for (const control of controls) {
                expect(
                    control.getVisible() === visible
                        ? undefined
                        : `${control.getName()}'s visibility was expected to be ${visible} but was not.`,
                ).toBeUndefined();
            }
        };

        test("attribute name not matching control SHOULD make control visible", () => {
            _sut.setVisible("theattribute" as any, false);
            const ctrl = _sut.getControl("thecontrol") as unknown as XdtXrm.AnyControl;
            expectVisible(false, ctrl);
            _sut.setVisible("theattribute" as any);
            expectVisible(true, ctrl);
        });

        test("multiple controls SHOULD make all controls visible", () => {
            _sut.setVisible("lastname" as any, false);
            const ctrl1 = _sut.context.getControl("lastname") as unknown as XdtXrm.AnyControl;
            const ctrl2 = _sut.context.getControl("header_lastname") as unknown as XdtXrm.AnyControl;
            expectVisible(false, ctrl1, ctrl2);
            _sut.setVisible("lastname");
            expectVisible(true, ctrl1, ctrl2);
        });

        test("hierarchy SHOULD be applied", () => {
            const setVisible = (visible: boolean, ...controls: { setVisible: (visible: boolean) => void }[]): void => {
                for (const control of controls) {
                    control.setVisible(visible);
                }
            };
            const ctrl1 = _sut.context.getControl("lastname") as unknown as XdtXrm.AnyControl;
            const section = ctrl1.getParent();
            const tab = section.getParent();
            expectVisible(true, ctrl1, section, tab);

            // Test false, undefined hierachy
            _sut.setVisible("lastname", false);
            expectVisible(false, ctrl1);
            expectVisible(true, section, tab);
            ctrl1.setVisible(true);

            // Test false, no hierachy
            _sut.setVisible("lastname", false, { setHierarchyVisibility: false });
            expectVisible(false, ctrl1);
            expectVisible(true, section, tab);
            ctrl1.setVisible(true);

            // Test false, hierachy
            _sut.setVisible("lastname", false, { setHierarchyVisibility: true });
            expectVisible(false, ctrl1, section, tab);

            // Test true undefined hierarchy
            _sut.setVisible("lastname", true);
            expectVisible(true, ctrl1, section, tab);
            setVisible(false, ctrl1, section, tab);

            // Test true, no hierarchy
            _sut.setVisible("lastname", true, { setHierarchyVisibility: false });
            expectVisible(true, ctrl1);
            expectVisible(false, section, tab);
            ctrl1.setVisible(false);

            // Test true, hiearchy
            _sut.setVisible("lastname", true, { setHierarchyVisibility: true });
            expectVisible(true, ctrl1, section, tab);
        });

        test("required logic SHOULD be applied", () => {
            // Originally Required
            _sut.setRequired("lastname");
            _sut.setVisible("lastname");
            expectLastNameRequired(true);

            _sut.setVisible("lastname", false);
            expectLastNameRequired(false);

            _sut.setVisible("lastname");
            expectLastNameRequired(true);

            // Originally not Required
            _sut.setRequired("lastname", false);
            _sut.setVisible("lastname", false);
            expectLastNameRequired(false);
            _sut.setVisible("lastname");
            expectLastNameRequired(false);
        });

        test("required specified SHOULD be honored", () => {
            _sut.setVisible("lastname", false);
            expectLastNameRequired(false);
            _sut.setVisible("lastname", true, { setRequired: false });
            expectLastNameRequired(false);

            _sut.setVisible("lastname", false);
            expectLastNameRequired(false);
            _sut.setVisible("lastname", true, { setRequired: true });
            expectLastNameRequired(true);
        });
    });
    describe("syncSectionVisibilityToSelectedValueByName", () => {
        let _section: XdtXrm.PageSection;
        beforeEach(() => {
            _section = _sut.context.ui.tabs.get("MainTab").sections.get("lastNameSection");
            _section.setVisible(false);
        });

        test("on parentaccountid change SHOULD show lastname section", () => {
            _sut.syncSectionVisibilityToSelectedValueByName("parentaccountid");
            expect(_section.getVisible()).toBe(false);
            _account.name = "No Charge";
            _sut.setValue("parentaccountid", _account);
            expect(_section.getVisible()).toBe(true);
            _sut.setValue("parentaccountid", _account2);
            expect(_section.getVisible()).toBe(false);
        });

        test("on lookup call setup SHOULD set visible", () => {
            expect(_section.getVisible()).toBe(false);
            _sut.setValue("parentaccountid", _account);
            _sut.syncSectionVisibilityToSelectedValueByName("parentaccountid");
            expect(_section.getVisible()).toBe(true);
        });

        test("on freight terms code change SHOULD show lastname section", () => {
            _sut.syncSectionVisibilityToSelectedValueByName("address1_freighttermscode");
            expect(_section.getVisible()).toBe(false);
            _sut.setValue("address1_freighttermscode", contact_address1_freighttermscode.NoCharge);
            expect(_section.getVisible()).toBe(true);
            _sut.setValue("address1_freighttermscode", contact_address1_freighttermscode.FOB);
            expect(_section.getVisible()).toBe(false);
        });

        test("on call setup SHOULD set visible", () => {
            expect(_section.getVisible()).toBe(false);
            _sut.setValue("address1_freighttermscode", contact_address1_freighttermscode.NoCharge);
            _sut.syncSectionVisibilityToSelectedValueByName("address1_freighttermscode");
            expect(_section.getVisible()).toBe(true);
        });
    });
});
