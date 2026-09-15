<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Functional\Test;

use PHPUnit\Framework\AssertionFailedError;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Core\User\InMemoryUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\UX\LiveComponent\Test\InteractsWithLiveComponents;
use Symfony\UX\LiveComponent\Tests\Fixtures\Component\Component2;
use Symfony\UX\LiveComponent\Tests\Fixtures\Factory\CategoryFixtureEntityFactory;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

/**
 * @author Kevin Bond <kevinbond@gmail.com>
 */
final class InteractsWithLiveComponentsTest extends KernelTestCase
{
    use Factories;
    use InteractsWithLiveComponents;
    use ResetDatabase;

<<<<<<< HEAD
    public function testCanRenderInitialData()
=======
    public function testCanRenderInitialData(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2');

        $this->assertStringContainsString('Count: 1', (string) $testComponent->render());
        $this->assertSame(1, $testComponent->component()->count);
    }

<<<<<<< HEAD
    public function testCanCreateWithClassString()
=======
    public function testCanCreateWithClassString(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent(Component2::class);

        $this->assertStringContainsString('Count: 1', (string) $testComponent->render());
        $this->assertSame(1, $testComponent->component()->count);
    }

<<<<<<< HEAD
    public function testCanCallLiveAction()
=======
    public function testCanCallLiveAction(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2');

        $this->assertStringContainsString('Count: 1', $testComponent->render());
        $this->assertSame(1, $testComponent->component()->count);

        $testComponent->call('increase');

        $this->assertStringContainsString('Count: 2', $testComponent->render());
        $this->assertSame(2, $testComponent->component()->count);
    }

<<<<<<< HEAD
    public function testCanCallLiveActionWithArguments()
=======
    public function testCanCallLiveActionWithArguments(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component6');

        $this->assertStringContainsString('Arg1: not provided', $testComponent->render());
        $this->assertStringContainsString('Arg2: not provided', $testComponent->render());
        $this->assertStringContainsString('Arg3: not provided', $testComponent->render());
        $this->assertNull($testComponent->component()->arg1);
        $this->assertNull($testComponent->component()->arg2);
        $this->assertNull($testComponent->component()->arg3);

        $testComponent->call('inject', ['arg1' => 'hello', 'arg2' => 666, 'custom' => '33.3']);

        $this->assertStringContainsString('Arg1: hello', $testComponent->render());
        $this->assertStringContainsString('Arg2: 666', $testComponent->render());
        $this->assertStringContainsString('Arg3: 33.3', $testComponent->render());
        $this->assertSame('hello', $testComponent->component()->arg1);
        $this->assertSame(666, $testComponent->component()->arg2);
        $this->assertSame(33.3, $testComponent->component()->arg3);
    }

<<<<<<< HEAD
    public function testCanEmitEvent()
=======
    public function testCanEmitEvent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2');

        $this->assertStringContainsString('Count: 1', $testComponent->render());
        $this->assertSame(1, $testComponent->component()->count);

        $testComponent->emit('triggerIncrease', ['amount' => 2]);

        $this->assertStringContainsString('Count: 5', $testComponent->render());
        $this->assertSame(5, $testComponent->component()->count);
    }

<<<<<<< HEAD
    public function testInvalidEventName()
=======
    public function testInvalidEventName(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2');

        $this->expectException(\InvalidArgumentException::class);

        $testComponent->emit('invalid');
    }

<<<<<<< HEAD
    public function testCanSetLiveProp()
=======
    public function testCanSetLiveProp(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_writable_props');

        $this->assertStringContainsString('Count: 1', $testComponent->render());
        $this->assertSame(1, $testComponent->component()->count);

        $testComponent->set('count', 100);

        $this->assertStringContainsString('Count: 100', $testComponent->render());
        $this->assertSame(100, $testComponent->component()->count);
    }

<<<<<<< HEAD
    public function testCanRefreshComponent()
=======
    public function testCanRefreshComponent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('track_renders');

        $this->assertStringContainsString('Re-Render Count: 1', $testComponent->render());

        $testComponent->refresh();

        $this->assertStringContainsString('Re-Render Count: 2', $testComponent->render());

        $testComponent->refresh();

        $this->assertStringContainsString('Re-Render Count: 3', $testComponent->render());
    }

<<<<<<< HEAD
    public function testCanAccessResponse()
=======
    public function testCanAccessResponse(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2');

        $response = $testComponent->call('redirect')->response();

        $this->assertSame(302, $response->getStatusCode());
        $this->assertSame('1', $response->headers->get('X-Custom-Header'));
    }

<<<<<<< HEAD
    public function testCannotUpdateComponentIfNoLongerInContext()
=======
    public function testCannotUpdateComponentIfNoLongerInContext(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component2')->call('redirect');

        $this->expectException(\LogicException::class);

        $testComponent->call('increase');
    }

<<<<<<< HEAD
    public function testRenderingIsLazy()
=======
    public function testRenderingIsLazy(): void
>>>>>>> upstream/3.x
    {
        if (!class_exists(IsGranted::class)) {
            $this->markTestSkipped('The security attributes are not available.');
        }

        $testComponent = $this->createLiveComponent('with_security');

        $this->expectException(AccessDeniedException::class);

        $testComponent->render();
    }

<<<<<<< HEAD
    public function testActingAs()
=======
    public function testActingAs(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('with_security')
            ->actingAs(new InMemoryUser('kevin', 'pass', ['ROLE_USER']))
        ;

        $this->assertStringNotContainsString('Username: kevin', $testComponent->render());

        $testComponent->call('setUsername');

        $this->assertStringContainsString('Username: kevin', $testComponent->render());
    }

<<<<<<< HEAD
    public function testCanSubmitForm()
=======
    public function testCanSubmitForm(): void
>>>>>>> upstream/3.x
    {
        CategoryFixtureEntityFactory::createMany(5);
        $testComponent = $this->createLiveComponent('form_with_many_different_fields_type');

        $response = $testComponent->submitForm(['form' => ['text' => 'foobar']])->response();

        $this->assertSame(200, $response->getStatusCode());
        $this->assertStringContainsString('foobar', $testComponent->render());
    }

<<<<<<< HEAD
    public function testAccessAllLivePropsInsideOnUpdatedHook()
=======
    public function testAccessAllLivePropsInsideOnUpdatedHook(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('with_on_updated', [
            'number1' => 1,
            'number2' => 2,
            'number3' => 3,
        ]);

        $this->assertStringContainsString('Total: 6', $testComponent->render());

        $testComponent->set('number1', 4);

        $this->assertStringContainsString('Total: 9', $testComponent->render());
    }

<<<<<<< HEAD
    public function testSetLocaleRenderLocalizedComponent()
=======
    public function testSetLocaleRenderLocalizedComponent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('localized_route');
        $testComponent->setRouteLocale('fr');
        $this->assertStringContainsString('Locale: fr', $testComponent->render());

        $testComponent->refresh();
        $this->assertStringContainsString('Locale: fr', $testComponent->render());

        $testComponent->setRouteLocale('es');
        $this->assertStringContainsString('Locale: es', $testComponent->render());

        $testComponent = $this->createLiveComponent('localized_route');
        $testComponent->setRouteLocale('de');
        $this->assertStringContainsString('Locale: de', $testComponent->render());
    }

<<<<<<< HEAD
    public function testAssertComponentEmitEvent()
=======
    public function testAssertComponentEmitEvent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->assertComponentEmitEvent($testComponent, 'event1')
            ->withData([
                'foo' => 'bar',
                'bar' => 'foo',
            ]);
    }

<<<<<<< HEAD
    public function testAssertComponentEmitEventFails()
=======
    public function testAssertComponentEmitEventFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The event "event1" data is different than expected.');
        $this->assertComponentEmitEvent($testComponent, 'event1')->withData([
            'foo' => 'bar',
        ]);
    }

<<<<<<< HEAD
    public function testComponentEmitsExpectedPartialEventData()
=======
    public function testComponentEmitsExpectedPartialEventData(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->assertComponentEmitEvent($testComponent, 'event1')
            ->withDataSubset(['foo' => 'bar'])
            ->withDataSubset(['bar' => 'foo'])
        ;
    }

<<<<<<< HEAD
    public function testComponentDoesNotEmitUnexpectedEvent()
=======
    public function testComponentDoesNotEmitUnexpectedEvent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->assertComponentNotEmitEvent($testComponent, 'event2');
    }

<<<<<<< HEAD
    public function testComponentDoesNotEmitUnexpectedEventFails()
=======
    public function testComponentDoesNotEmitUnexpectedEventFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The component "component_with_emit" did emit event "event1".');
        $this->assertComponentNotEmitEvent($testComponent, 'event1');
    }

<<<<<<< HEAD
    public function testComponentEmitsEventWithIncorrectDataFails()
=======
    public function testComponentEmitsEventWithIncorrectDataFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatEmits');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The event "event1" data is different than expected.');
        $this->assertComponentEmitEvent($testComponent, 'event1')->withData([
            'foo' => 'bar',
            'foo2' => 'bar2',
        ]);
    }

<<<<<<< HEAD
    public function testAssertComponentDispatchBrowserEvent()
=======
    public function testAssertComponentDispatchBrowserEvent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->assertComponentDispatchBrowserEvent($testComponent, 'browser-event')
            ->withPayload([
                'fooKey' => 'barVal',
                'barKey' => 'fooVal',
            ]);
    }

<<<<<<< HEAD
    public function testAssertComponentDispatchBrowserEventFails()
=======
    public function testAssertComponentDispatchBrowserEventFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The event "browser-event" payload is different than expected.');
        $this->assertComponentDispatchBrowserEvent($testComponent, 'browser-event')->withPayload([
            'fooKey' => 'barVal',
        ]);
    }

<<<<<<< HEAD
    public function testComponentDispatchesExpectedPartialBrowserEventData()
=======
    public function testComponentDispatchesExpectedPartialBrowserEventData(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->assertComponentDispatchBrowserEvent($testComponent, 'browser-event')
            ->withPayloadSubset(['fooKey' => 'barVal'])
            ->withPayloadSubset(['barKey' => 'fooVal'])
        ;
    }

<<<<<<< HEAD
    public function testComponentDoesNotDispatchUnexpectedBrowserEvent()
=======
    public function testComponentDoesNotDispatchUnexpectedBrowserEvent(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->assertComponentNotDispatchBrowserEvent($testComponent, 'browser-event2');
    }

<<<<<<< HEAD
    public function testComponentDoesNotDispatchUnexpectedBrowserEventFails()
=======
    public function testComponentDoesNotDispatchUnexpectedBrowserEventFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The component "component_with_emit" did dispatch browser event "browser-event".');
        $this->assertComponentNotDispatchBrowserEvent($testComponent, 'browser-event');
    }

<<<<<<< HEAD
    public function testComponentDispatchesBrowserEventWithIncorrectDataFails()
=======
    public function testComponentDispatchesBrowserEventWithIncorrectDataFails(): void
>>>>>>> upstream/3.x
    {
        $testComponent = $this->createLiveComponent('component_with_emit');

        $testComponent->call('actionThatDispatchesABrowserEvent');

        $this->expectException(AssertionFailedError::class);
        $this->expectExceptionMessage('The event "browser-event" payload is different than expected.');
        $this->assertComponentDispatchBrowserEvent($testComponent, 'browser-event')->withPayload([
            'fooKey' => 'barVal',
            'fooKey2' => 'barVal2',
        ]);
    }
}
