<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Functional\EventListener;

use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\UX\LiveComponent\Tests\LiveComponentTestHelper;
use Zenstruck\Browser\Test\HasBrowser;

final class DeferLiveComponentSubscriberTest extends KernelTestCase
{
    use HasBrowser;
    use LiveComponentTestHelper;

<<<<<<< HEAD
    public function testItSetsDeferredTemplateIfLiveIdNotPassed()
=======
    public function testItSetsDeferredTemplateIfLiveIdNotPassed(): void
>>>>>>> upstream/3.x
    {
        $div = $this->browser()
            ->visit('/render-template/render_deferred_component')
            ->assertSuccessful()
            ->crawler()
            ->filter('div')
        ;

        $this->assertSame('', trim($div->html()));
        $this->assertSame('live:connect->live#$render', $div->attr('data-action'));

        $component = $this->mountComponent('deferred_component', [
            'id' => $div->attr('id'),
        ]);

        $dehydrated = $this->dehydrateComponent($component);

        $div = $this->browser()
            ->visit('/_components/deferred_component?props='.urlencode(json_encode($dehydrated->getProps())))
            ->assertSuccessful()
            ->crawler()
            ->filter('div')
        ;

        $this->assertSame('Long awaited data', $div->html());
    }

<<<<<<< HEAD
    public function testItIncludesGivenTemplateWhileLoadingDeferredComponent()
=======
    public function testItIncludesGivenTemplateWhileLoadingDeferredComponent(): void
>>>>>>> upstream/3.x
    {
        $div = $this->browser()
            ->visit('/render-template/render_deferred_component_with_template')
            ->assertSuccessful()
            ->crawler()
            ->filter('div')
        ;

        $this->assertSame('I\'m loading a reaaaally slow live component', trim($div->html()));

        $component = $this->mountComponent('deferred_component', [
            'id' => $div->attr('id'),
        ]);

        $dehydrated = $this->dehydrateComponent($component);

        $div = $this->browser()
            ->visit('/_components/deferred_component?props='.urlencode(json_encode($dehydrated->getProps())))
            ->assertSuccessful()
            ->crawler()
            ->filter('div')
        ;

        $this->assertStringContainsString('Long awaited data', $div->html());
    }

<<<<<<< HEAD
    public function testItIncludesComponentTemplateBlockAsPlaceholder()
=======
    public function testItIncludesComponentTemplateBlockAsPlaceholder(): void
>>>>>>> upstream/3.x
    {
        $div = $this->browser()
            ->visit('/render-template/render_deferred_component_with_placeholder')
            ->assertSuccessful()
            ->crawler()
            ->filter('div');

        $this->assertSame('<span class="loading-row"></span><span class="loading-row"></span>', trim($div->html()));
    }

<<<<<<< HEAD
    public function testItDoesNotIncludesPlaceholderWhenRendered()
=======
    public function testItDoesNotIncludesPlaceholderWhenRendered(): void
>>>>>>> upstream/3.x
    {
        $div = $this->browser()
            ->visit('/render-template/render_component_with_placeholder')
            ->assertSuccessful()
            ->crawler();

        $this->assertStringNotContainsString('<span class="loading-row">', $div->html());
    }

<<<<<<< HEAD
    public function testItAllowsToSetCustomLoadingHtmlTag()
=======
    public function testItAllowsToSetCustomLoadingHtmlTag(): void
>>>>>>> upstream/3.x
    {
        $crawler = $this->browser()
            ->visit('/render-template/render_deferred_component_with_li_tag')
            ->assertSuccessful()
            ->crawler()
        ;

        $this->assertSame(0, $crawler->filter('div')->count());
        $this->assertSame(1, $crawler->filter('li')->count());
    }

<<<<<<< HEAD
    public function testLazyComponentIsNotRendered()
=======
    public function testLazyComponentIsNotRendered(): void
>>>>>>> upstream/3.x
    {
        $crawler = $this->browser()
            ->visit('/render-template/render_lazy_component')
            ->assertSuccessful()
            ->crawler();

        $div = $crawler->filter('div');

        $this->assertSame('', trim($div->html()));
        $this->assertSame('lazy', $div->attr('loading'));
        $this->assertSame('live:appear->live#$render', $div->attr('data-action'));
    }

    #[DataProvider('provideLoadingValues')]
<<<<<<< HEAD
    public function testLazyComponentRenderingDependsOnLazyValue(mixed $lazy, bool $isRendered)
=======
    public function testLazyComponentRenderingDependsOnLazyValue(mixed $lazy, bool $isRendered): void
>>>>>>> upstream/3.x
    {
        $crawler = $this->browser()
            ->visit('/render-template/render_lazy_component_with_value?loading='.$lazy)
            ->assertSuccessful();

        $crawler->assertElementCount('#count', $isRendered ? 1 : 0);
        $crawler->assertElementCount('[loading="lazy"]', $isRendered ? 0 : 1);
    }

    public static function provideLoadingValues(): iterable
    {
        return [
            ['lazy', false],
            [false, true],
            ['', true],
        ];
    }

<<<<<<< HEAD
    public function testLazyComponentIsRenderedLaterWithInitialData()
=======
    public function testLazyComponentIsRenderedLaterWithInitialData(): void
>>>>>>> upstream/3.x
    {
        $crawler = $this->browser()
            ->visit('/render-template/render_lazy_component')
            ->assertSuccessful()
            ->crawler();

        $componentDiv = $crawler->filter('div');
        $this->assertEmpty(trim($componentDiv->html()));

        $props = json_decode($componentDiv->attr('data-live-props-value'), true);

        $browser = $this->browser()
            ->throwExceptions()
            ->post('/_components/tally_component', [
                'body' => [
                    'data' => json_encode([
                        'props' => $props,
                    ]),
                ],
            ])->assertSuccessful()
        ;

        $browser->assertElementCount('#count', 1);
        $browser->assertElementAttributeContains('#count', 'value', '7');
    }

<<<<<<< HEAD
    public function testSubscriberDoesNotHandleTwigComponent()
=======
    public function testSubscriberDoesNotHandleTwigComponent(): void
>>>>>>> upstream/3.x
    {
        $browser = $this->browser()
            ->visit('/render-template/render_lazy_twig_component')
            ->assertSuccessful();

        $browser->assertElementCount('[loading="lazy"]', 1);
        $browser->assertElementCount('[data-controller]', 0);

        $componentDiv = $browser->crawler()->filter('div');
        $this->assertSame('<div loading="lazy">FooBar</div>', trim($componentDiv->outerHtml()));
    }
}
