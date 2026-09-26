import type BackendResponse from '../../Backend/BackendResponse';
import type Component from '../index';
import type { PluginInterface } from './PluginInterface';

export default class implements PluginInterface {
    private isConnected = false;

    attachToComponent(component: Component): void {
        // [CUSTOM] 'render:started' is typed in ComponentHooks: the 2nd argument is a BackendResponse, not a Response
        component.on('render:started', (html: string, backendResponse: BackendResponse, controls: { shouldRender: boolean }) => {
            if (!this.isConnected) {
                controls.shouldRender = false;
            }
        });

        component.on('connect', () => {
            this.isConnected = true;
        });

        component.on('disconnect', () => {
            this.isConnected = false;
        });
    }
}
