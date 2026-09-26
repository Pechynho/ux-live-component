/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// [CUSTOM] Tests for canceling a request from the request:started hook
// (controls.shouldSend, and the older controls.abortRequest).
// Upstream PR: https://github.com/symfony/ux/pull/3929

import { waitFor } from '@testing-library/dom';
import { describe, expect, it, vi } from 'vitest';
import type { BackendAction, BackendInterface } from '../../../src/Backend/Backend';
import BackendRequest from '../../../src/Backend/BackendRequest';
import type BackendResponse from '../../../src/Backend/BackendResponse';
import Component from '../../../src/Component';
import { noopElementDriver } from '../../tools';

const makeRecordingComponent = () => {
    const requests: { actions: BackendAction[]; updated: any }[] = [];
    const backend: BackendInterface = {
        makeRequest(_props: any, actions: BackendAction[], updated: any): BackendRequest {
            requests.push({ actions, updated });

            return new BackendRequest(
                // @ts-expect-error Response doesn't quite match the underlying interface
                new Promise((resolve) => resolve(new Response('<div data-live-props-value="{}"></div>'))),
                [],
                []
            );
        },
    };

    const component = new Component(
        document.createElement('div'),
        'test-component',
        { firstName: '' },
        [],
        null,
        backend,
        new noopElementDriver()
    );

    return { component, requests };
};

describe('request:started hook', () => {
    it.each([
        ['shouldSend', (controls: any) => (controls.shouldSend = false)],
        ['abortRequest', (controls: any) => (controls.abortRequest = true)],
    ])('does not send the request or start the loading state when %s cancels it', async (_name, cancel) => {
        const { component, requests } = makeRecordingComponent();
        const loadingStarted = vi.fn();
        component.on('loading.state:started', loadingStarted);
        component.on('request:started', (_requestConfig, controls) => {
            cancel(controls);
        });

        component.render();
        await new Promise((resolve) => setTimeout(resolve, 5));

        expect(requests).toHaveLength(0);
        expect(loadingStarted).not.toHaveBeenCalled();
    });

    it('sends the changes of a canceled request with the next request', async () => {
        const { component, requests } = makeRecordingComponent();
        let shouldSend = false;
        component.on('request:started', (_requestConfig, controls) => {
            controls.shouldSend = shouldSend;
        });

        component.set('firstName', 'Ryan', false);
        component.action('save', { id: 5 }, 0);
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(requests).toHaveLength(0);

        shouldSend = true;
        await component.render();

        expect(requests).toHaveLength(1);
        expect(requests[0].actions).toEqual([{ name: 'save', args: { id: 5 } }]);
        expect(requests[0].updated).toEqual({ firstName: 'Ryan' });
    });

    it('resolves the promise of a canceled request with the response of the next request', async () => {
        const { component } = makeRecordingComponent();
        let shouldSend = false;
        component.on('request:started', (_requestConfig, controls) => {
            controls.shouldSend = shouldSend;
        });

        let canceledResponse: BackendResponse | null = null;
        component.render().then((response) => {
            canceledResponse = response;
        });
        await new Promise((resolve) => setTimeout(resolve, 5));
        expect(canceledResponse).toBeNull();

        shouldSend = true;
        const response = await component.render();

        await waitFor(() => expect(canceledResponse).toBe(response));
    });
});
