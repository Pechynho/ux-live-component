/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// [CUSTOM] Tests for the LiveUrl navigation-race guard: a late response must
// not rewrite the URL of a history entry the user has already navigated away
// from (detected via the navigation epoch + element connectedness).

import { afterEach, describe, expect, it } from 'vitest';
import { createTest, expectCurrentSearch, initComponent, setCurrentSearch, shutdownTests } from '../../tools';
import type Component from '../../../src/Component';

const startRequestWithLiveUrl = async (test: Awaited<ReturnType<typeof createTest>>, liveUrl: string) => {
    test.expectsAjaxCall().expectUpdatedData({ prop: 'foo' }).willReturnLiveUrl(liveUrl).delayResponse(30);

    const requestStarted = new Promise<void>((resolve) => {
        (test.component as Component).on('loading.state:started', () => resolve());
    });
    const responsePromise = test.component.set('prop', 'foo', true);
    await requestStarted;

    // wrapped in an object so the async function does not unwrap the promise
    return { responsePromise };
};

// Turbo dispatches its events as bubbling events, so they reach the window
const dispatchTurboVisit = () => {
    document.documentElement.dispatchEvent(new CustomEvent('turbo:visit', { bubbles: true }));
};

describe('LiveController LiveUrl update after navigation', () => {
    afterEach(() => {
        shutdownTests();
        history.replaceState(history.state, '', '/');
        setCurrentSearch('');
    });

    const template = (data: any) => `
        <div ${initComponent(data, { queryMapping: { prop: { name: 'prop' } } })}>Prop: ${data.prop}</div>
    `;

    it('skips the URL update when the component element is no longer in the document', async () => {
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // simulate a completed navigation: the component's element is detached
        test.element.remove();

        await responsePromise;

        expectCurrentSearch().toEqual('');
    });

    it('skips the URL update when a Turbo visit started while the request was in flight', async () => {
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        dispatchTurboVisit();

        await responsePromise;

        expectCurrentSearch().toEqual('');
        // the response itself is still processed as usual
        expect(test.element).toHaveTextContent('Prop: foo');
    });

    it('skips the URL update when a popstate navigation happened while the request was in flight', async () => {
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // simulate history back/forward
        window.dispatchEvent(new Event('popstate'));

        await responsePromise;

        expectCurrentSearch().toEqual('');
    });

    it('applies the URL update for a request sent after a navigation', async () => {
        const test = await createTest({ prop: '' }, template);

        // navigations that already happened must not block future requests
        dispatchTurboVisit();
        window.dispatchEvent(new Event('popstate'));

        test.expectsAjaxCall().expectUpdatedData({ prop: 'foo' }).willReturnLiveUrl('?prop=foo');

        await test.component.set('prop', 'foo', true);

        expectCurrentSearch().toEqual('?prop=foo');
    });

    it('applies a LiveUrl that changes the pathname', async () => {
        // a LiveProp mapped with UrlMapping(mapPath: true) changes the pathname
        const test = await createTest({ prop: '' }, template);

        test.expectsAjaxCall().expectUpdatedData({ prop: 'foo' }).willReturnLiveUrl('/products/foo');

        await test.component.set('prop', 'foo', true);

        expect(window.location.pathname).toEqual('/products/foo');
    });

    it('applies the URL update when the pathname was changed by another component while the request was in flight', async () => {
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // simulate a sibling component applying its own path-mapped LiveUrl
        // (replaceState does not fire popstate, so this is not a navigation)
        history.replaceState(history.state, '', '/other-page');

        await responsePromise;

        expectCurrentSearch().toEqual('?prop=foo');
    });
});
