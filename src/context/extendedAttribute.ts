import { SafeControlContext } from "./safeControl";

export class ExtendedAttributeContext extends SafeControlContext {
    public getDisplayValue(attributeName: string): string {
        const att = this.getAttribute(attributeName);
        if (!att) {
            return "";
        }
        let text: string;
        switch (att.getAttributeType()) {
            case "optionset":
                text = (att as XdtXrm.OptionSetAttribute<number>).getText();
                break;
            case "lookup":
                const values = (att as XdtXrm.LookupAttribute<any>).getValue();
                if (values && values.length > 0) {
                    text = values.map((e) => e.name).join(", "); // Not sure of the display value with mulitiple values...
                } else {
                    text = "";
                }
                break;
            default:
                text = att.getValue();
                break;
        }
        return text || "";
    }

    //#region Populate Name

    /**
     * Will update the name given to the format provided.
     * Performs an additional check for null or empty values and trims them from the end of the format (Assumes the index of the format is sequential, not {0} {3} {2})
     * Call site example: initializeFormattedValue("allgnt_name", "{0}: {1} - {2}", "contact", "stateorprovince", "city");
     *
     * @param attributeName The attribute of the field to default
     * @param format The format used to default the name
     */
    public initializeFormattedValue(attributeName: string, format: string, ...args: string[]): void {
        if (!this.getAttribute(attributeName)) {
            return;
        }

        if (args.length === 0) {
            // If there are not any arguments there's nothing to format

            this.setValue(attributeName, format);
            return;
        }

        let hasValue = false;

        // Add Event Handlers
        for (let i = 0; i < args.length; i++) {
            hasValue = hasValue || this.getValue(args[i]);
            this.addOnChange(args[i], () => {
                this.updateNameHandler(attributeName, format, args);
            });
        }

        // Set Name if at least one value is populated and the name field is not
        if (hasValue) {
            this.updateNameHandler(attributeName, format, args);
        }
    }

    /**
     * Uses the args array to get field's values to populate the field
     *
     * @param nameField The attribute of the field to default
     * @param format The format to use to set the string value of
     * @param args String in the format of "Hello {0}
     * @returns {}
     */
    updateNameHandler(nameField: string, format: string, args: string[]): void {
        let i: number; // check for ending null values to trim string if need be
        // Allows a format of "{0} - {1} - {2}" to be "Foo", rather than "Foo - - ".
        for (i = 0; i < args.length - 1; i++) {
            args = <string[]>(args.constructor === Array ? args : [args]);

            if (this.context.getAttribute(args[i])?.getValue()) {
                continue; // Value not null
            }
            const token = `{${i}}`;
            let startToken = format.indexOf("{");
            let endToken = format.indexOf("}", startToken);
            let index: number;
            if (format.substring(startToken + 1, endToken) === i + "") {
                // First value in format, remove up to the second
                index = format.indexOf("{", endToken);
                if (index >= 0) {
                    format = format.substring(0, startToken) + format.substring(index);
                }
            } else {
                // Not first value in format, remove up to the previous
                startToken = format.indexOf(token);
                endToken = startToken + token.length;
                index = format.lastIndexOf("}", startToken);
                if (index > 0) {
                    format = format.substring(0, index + 1) + format.substring(endToken);
                }
            }
        }

        // Copy array and update format to keep format from being updated in args array for next call
        const formatArgs = args.slice();
        formatArgs.unshift(format);

        for (i = 1; i < formatArgs.length; i++) {
            formatArgs[i] = this.getDisplayValue(formatArgs[i]);
        }
        const valueToSet = this.format(format, formatArgs);
        this.setValue(nameField, valueToSet);
    }

    /**
     * Formats a string in a C#. ex format("{0} - {1}", "Apple", "Banana") => "Apple - Banana".
     * @param text Format text.
     * @param args Args to format text
     * @returns Formatted text
     */
    format(text: string, args: string[]): string {
        if (!text) {
            throw new Error("Format must contain a value!");
        }

        // Check if there are two arguments in the arguments list.
        if (args.length < 1) {
            // If there are not 1 or more arguments there's nothing to replace
            // just return the original text.
            return text;
        }

        for (let i = 0; i < args.length; i++) {
            // Iterate through the tokens and replace their placeholders from the original text in order.
            text = i + 1 < args.length ? text.replace(new RegExp(`\\{${i}\\}`, "gi"), args[i + 1]) : text;
        }
        return text;
    }
}
