export function showAndLogError(
    displayMessage: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    err: any,
    options?: Xrm.Navigation.ErrorDialogOptions,
): Xrm.Async.PromiseLike<any> {
    options = options || {};
    if (!options.message) {
        options.message = displayMessage;
    }
    if (!options.details) {
        options.details = err;
    }
    console.error(options.message, err);
    return Xrm.Navigation.openErrorDialog(options);
}
