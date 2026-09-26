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
// from (detected via the Navigation API entry key + element connectedness).
// Upstream PR: https://github.com/symfony/ux/pull/3928

import { afterEach, describe, expect, it } from 'vitest';
import type Component from '../../../src/Component';
import { createTest, expectCurrentSearch, initComponent, setCurrentSearch, shutdownTests } from '../../tools';

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

// jsdom has no Navigation API
const stubNavigation = (key: string) => {
    const navigation = { currentEntry: { key } };
    Object.defineProperty(window, 'navigation', { value: navigation, configurable: true });

    return navigation;
};

describe('LiveController LiveUrl update after navigation', () => {
    afterEach(() => {
        shutdownTests();
        delete (window as any).navigation;
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

    it('skips the URL update when the history entry changed while the request was in flight', async () => {
        const navigation = stubNavigation('first-entry');
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // simulate a Turbo visit or history back/forward: a new entry is current
        navigation.currentEntry = { key: 'second-entry' };

        await responsePromise;

        expectCurrentSearch().toEqual('');
        // the response itself is still processed as usual
        expect(test.element).toHaveTextContent('Prop: foo');
    });

    it('applies the URL update when a Turbo visit started but the page was not replaced yet', async () => {
        stubNavigation('first-entry');
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // turbo:visit fires while the next page is still being fetched: the
        // response still belongs to the current history entry
        document.documentElement.dispatchEvent(new CustomEvent('turbo:visit', { bubbles: true }));

        await responsePromise;

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
        stubNavigation('first-entry');
        const test = await createTest({ prop: '' }, template);

        const { responsePromise } = await startRequestWithLiveUrl(test, '?prop=foo');

        // simulate a sibling component applying its own path-mapped LiveUrl
        // (replaceState keeps the history entry)
        history.replaceState(history.state, '', '/other-page');

        await responsePromise;

        expectCurrentSearch().toEqual('?prop=foo');
    });
});
