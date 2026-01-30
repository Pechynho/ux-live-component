import { Controller } from '@hotwired/stimulus';

declare class export_default$2{
    response: Response;
    private body;
    private liveUrl;
    constructor(response: Response);
    getBody(): Promise<string>;
    getLiveUrl(): string | null;
}

declare class export_default$1{
    promise: Promise<Response>;
    actions: string[];
    updatedModels: string[];
    isResolved: boolean;
    constructor(promise: Promise<Response>, actions: string[], updateModels: string[]);
    /**
     * Does this BackendRequest contain at least on action in targetedActions?
     */
    containsOneOfActions(targetedActions: string[]): boolean;
    /**
     * Does this BackendRequest includes updates for any of these models?
     */
    areAnyModelsUpdated(targetedModels: string[]): boolean;
}

interface ChildrenFingerprints {
    [key: string]: {
        fingerprint: string;
        tag: string;
    };
}
interface BackendInterface {
    makeRequest(props: any, actions: BackendAction[], updated: {
        [key: string]: any;
    }, children: ChildrenFingerprints, updatedPropsFromParent: {
        [key: string]: any;
    }, files: {
        [key: string]: FileList;
    }): export_default$1;
}
interface BackendAction {
    name: string;
    args: Record<string, string>;
}

interface ElementDriver {
    getModelName(element: HTMLElement): string | null;
    getComponentProps(): any;
    /**
     * Given an element from a response, find all the events that should be emitted.
     */
    getEventsToEmit(): Array<{
        event: string;
        data: any;
        target: string | null;
        componentName: string | null;
    }>;
    /**
     * Given an element from a response, find all the events that should be dispatched.
     */
    getBrowserEventsToDispatch(): Array<{
        event: string;
        payload: any;
    }>;
}

interface PluginInterface {
    attachToComponent(component: Component): void;
}

declare class export_default{
    /**
     * Original, read-only props that represent the original component state.
     *
     * @private
     */
    private props;
    /**
     * A list of props that have been "dirty" (changed) since the last request to the server.
     */
    private dirtyProps;
    /**
     * A list of dirty props that were sent to the server, but the response has
     * not yet been received.
     */
    private pendingProps;
    /**
     * A list of props that the parent wants us to update.
     *
     * These will be sent on the next request to the server.
     */
    private updatedPropsFromParent;
    constructor(props: any);
    /**
     * Returns the props with the given name.
     *
     * This allows for non-normalized model names - e.g.
     * user[firstName] -> user.firstName and also will fetch
     * deeply (fetching the "firstName" sub-key from the "user" key).
     */
    get(name: string): any;
    has(name: string): boolean;
    /**
     * Sets data back onto the value store.
     *
     * The name can be in the non-normalized format.
     *
     * Returns true if the new value is different from the existing value.
     */
    set(name: string, value: any): boolean;
    getOriginalProps(): any;
    getDirtyProps(): any;
    getUpdatedPropsFromParent(): any;
    /**
     * Called when an update request begins.
     */
    flushDirtyPropsToPending(): void;
    /**
     * Called when an update request finishes successfully.
     */
    reinitializeAllProps(props: any): void;
    /**
     * Called after an update request failed.
     */
    pushPendingPropsBackToDirty(): void;
    /**
     * This is used when a parent component is rendering, and it includes
     * a fresh set of props that should be updated on the child component.
     *
     * The server manages returning only the props that should be updated onto
     * the child, so we don't need to worry about that.
     *
     * The props are stored in a different place, because the existing props
     * have their own checksum and these new props have *their* own checksum.
     * So, on the next render, both need to be sent independently.
     *
     * Returns true if any of the props are different.
     */
    storeNewPropsFromParent(props: any): boolean;
}

type MaybePromise<T = void> = T | Promise<T>;
type ComponentHooks = {
    connect: (component: Component) => MaybePromise;
    disconnect: (component: Component) => MaybePromise;
    'request:started': (requestConfig: any, controls: {
        abortRequest: boolean;
    }) => MaybePromise;
    'render:started': (html: string, backendResponse: export_default$2, controls: {
        shouldRender: boolean;
    }) => MaybePromise;
    'render:finished': (component: Component) => MaybePromise;
    'response:error': (backendResponse: export_default$2, controls: {
        displayError: boolean;
        resetLoadingState: boolean;
    }) => MaybePromise;
    'loading.state:started': (element: HTMLElement, request: export_default$1) => MaybePromise;
    'loading.state:finished': (element: HTMLElement) => MaybePromise;
    'model:set': (model: string, value: any, component: Component) => MaybePromise;
};
type ComponentHookName = keyof ComponentHooks;
type ComponentHookCallback<T extends string = ComponentHookName> = T extends ComponentHookName ? ComponentHooks[T] : (...args: any[]) => MaybePromise;
type ConnectHook = ComponentHooks['connect'];
type DisconnectHook = ComponentHooks['disconnect'];
type RequestStartedHook = ComponentHooks['request:started'];
type RenderStartedHook = ComponentHooks['render:started'];
type RenderFinishedHook = ComponentHooks['render:finished'];
type ResponseErrorHook = ComponentHooks['response:error'];
type LoadingStateStartedHook = ComponentHooks['loading.state:started'];
type LoadingStateFinishedHook = ComponentHooks['loading.state:finished'];
type ModelSetHook = ComponentHooks['model:set'];
declare class Component {
    readonly element: HTMLElement;
    readonly name: string;
    readonly listeners: Map<string, string[]>;
    private backend;
    readonly elementDriver: ElementDriver;
    id: string | null;
    /**
     * A fingerprint that identifies the props/input that was used on
     * the server to create this component, especially if it was a
     * child component. This is sent back to the server and can be used
     * to determine if any "input" to the child component changed and thus,
     * if the child component needs to be re-rendered.
     */
    fingerprint: string;
    readonly valueStore: export_default;
    private readonly unsyncedInputsTracker;
    private hooks;
    defaultDebounce: number;
    private backendRequest;
    /** Actions that are waiting to be executed */
    private pendingActions;
    /** Files that are waiting to be sent */
    private pendingFiles;
    /** Is a request waiting to be made? */
    private isRequestPending;
    /** Current "timeout" before the pending request should be sent. */
    private requestDebounceTimeout;
    private nextRequestPromise;
    private nextRequestPromiseResolve;
    private externalMutationTracker;
    /**
     * @param element The root element
     * @param name    The name of the component
     * @param props   Readonly component props
     * @param listeners Array of event -> action listeners
     * @param id      Some unique id to identify this component. Needed to be a child component
     * @param backend Backend instance for updating
     * @param elementDriver Class to get "model" name from any element.
     */
    constructor(element: HTMLElement, name: string, props: any, listeners: Array<{
        event: string;
        action: string;
    }>, id: string | null, backend: BackendInterface, elementDriver: ElementDriver);
    addPlugin(plugin: PluginInterface): void;
    connect(): void;
    disconnect(): void;
    on<T extends string | ComponentHookName = ComponentHookName>(hookName: T, callback: ComponentHookCallback<T>): void;
    off<T extends string | ComponentHookName = ComponentHookName>(hookName: T, callback: ComponentHookCallback<T>): void;
    set(model: string, value: any, reRender?: boolean, debounce?: number | boolean): Promise<export_default$2>;
    getData(model: string): any;
    action(name: string, args?: any, debounce?: number | boolean): Promise<export_default$2>;
    files(key: string, input: HTMLInputElement): void;
    render(): Promise<export_default$2>;
    /**
     * [CUSTOM] Sends a standalone request to the given live action and returns
     * the raw Response object.
     *
     * Unlike action(), this does NOT trigger a re-render of the component —
     * it simply fires a one-off POST to the action endpoint with the current
     * props / dirty state and returns the fetch Response so the caller can
     * inspect status, headers, body, etc.
     */
    request(action: string, args?: Record<string, string>): Promise<Response>;
    /**
     * Returns an array of models the user has modified, but whose model has not
     * yet been updated.
     */
    getUnsyncedModels(): string[];
    emit(name: string, data: any, onlyMatchingComponentsNamed?: string | null): void;
    emitUp(name: string, data: any, onlyMatchingComponentsNamed?: string | null): void;
    emitSelf(name: string, data: any): void;
    private performEmit;
    private doEmit;
    private isTurboEnabled;
    private tryStartingRequest;
    private performRequest;
    private processRerender;
    private calculateDebounce;
    private clearRequestDebounceTimeout;
    private debouncedStartRequest;
    private renderError;
    private resetPromise;
    /**
     * Called on a child component after the parent component render has requested
     * that the child component update its props & re-render if necessary.
     */
    _updateFromParentProps(props: any): void;
}

declare const getComponent: (element: HTMLElement) => Promise<Component>;

interface LiveEvent extends CustomEvent {
    detail: {
        controller: LiveController;
        component: Component;
    };
}
interface LiveController {
    element: HTMLElement;
    component: Component;
}
declare class LiveControllerDefault extends Controller<HTMLElement> implements LiveController {
    static values: {
        name: StringConstructor;
        url: StringConstructor;
        props: {
            type: ObjectConstructor;
            default: {};
        };
        propsUpdatedFromParent: {
            type: ObjectConstructor;
            default: {};
        };
        listeners: {
            type: ArrayConstructor;
            default: any[];
        };
        eventsToEmit: {
            type: ArrayConstructor;
            default: any[];
        };
        eventsToDispatch: {
            type: ArrayConstructor;
            default: any[];
        };
        debounce: {
            type: NumberConstructor;
            default: number;
        };
        fingerprint: {
            type: StringConstructor;
            default: string;
        };
        requestMethod: {
            type: StringConstructor;
            default: string;
        };
    };
    readonly nameValue: string;
    readonly urlValue: string;
    readonly propsValue: any;
    propsUpdatedFromParentValue: any;
    readonly listenersValue: Array<{
        event: string;
        action: string;
    }>;
    readonly eventsToEmitValue: Array<{
        event: string;
        data: any;
        target: string | null;
        componentName: string | null;
    }>;
    readonly eventsToDispatchValue: Array<{
        event: string;
        payload: any;
    }>;
    readonly hasDebounceValue: boolean;
    readonly debounceValue: number;
    readonly fingerprintValue: string;
    readonly requestMethodValue: 'get' | 'post';
    /** The component, wrapped in the convenience Proxy */
    private proxiedComponent;
    private mutationObserver;
    /** The raw Component object */
    component: Component;
    pendingActionTriggerModelElement: HTMLElement | null;
    private elementEventListeners;
    private pendingFiles;
    static backendFactory: (controller: LiveControllerDefault) => BackendInterface;
    initialize(): void;
    connect(): void;
    disconnect(): void;
    /**
     * Called to update one piece of the model.
     *
     *      <button data-action="live#update" data-model="foo" data-value="5">
     */
    update(event: any): void;
    action(event: any): void;
    $render(): Promise<export_default$2>;
    emit(event: any): void;
    emitUp(event: any): void;
    emitSelf(event: any): void;
    /**
     * Update a model value.
     *
     * @param {string} model The model to update
     * @param {any} value The new value
     * @param {boolean} shouldRender Whether a re-render should be triggered
     * @param {number|boolean} debounce
     */
    $updateModel(model: string, value: any, shouldRender?: boolean, debounce?: number | boolean): Promise<export_default$2>;
    propsUpdatedFromParentValueChanged(): void;
    fingerprintValueChanged(): void;
    private getEmitDirectives;
    private createComponent;
    private connectComponent;
    private disconnectComponent;
    private handleInputEvent;
    private handleChangeEvent;
    /**
     * Sets a model given an element and some event.
     *
     * This parses the "data-model" from the element and takes
     * into account modifiers like "debounce", "norender" and "on()".
     *
     * This is used, for example, the grab the new value from an input
     * on "change" and set that new value onto the model.
     *
     * It's also used to, on click, set the value from a button
     * with data-model="" and data-value"".
     *
     * @param element
     * @param eventName If specified (e.g. "input" or "change"), the model may
     *                  skip updating if the on() modifier is passed (e.g. on(change)).
     *                  If not passed, the model will always be updated.
     */
    private updateModelFromElementEvent;
    private dispatchEvent;
    private onMutations;
}

export { Component, type ComponentHookCallback, type ComponentHookName, type ComponentHooks, type ConnectHook, type DisconnectHook, type LiveController, type LiveEvent, type LoadingStateFinishedHook, type LoadingStateStartedHook, type ModelSetHook, type RenderFinishedHook, type RenderStartedHook, type RequestStartedHook, type ResponseErrorHook, LiveControllerDefault as default, getComponent };
