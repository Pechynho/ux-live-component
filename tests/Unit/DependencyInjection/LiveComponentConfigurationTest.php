<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Unit\DependencyInjection;

use PHPUnit\Framework\TestCase;
use Symfony\Component\Config\Definition\Exception\InvalidConfigurationException;
use Symfony\Component\Config\Definition\Processor;
use Symfony\UX\LiveComponent\DependencyInjection\LiveComponentExtension;

class LiveComponentConfigurationTest extends TestCase
{
<<<<<<< HEAD
    public function testDefaultSecret()
=======
    public function testDefaultSecret(): void
>>>>>>> upstream/3.x
    {
        $processor = new Processor();
        $config = $processor->processConfiguration(new LiveComponentExtension(), []);

        $this->assertEquals('%kernel.secret%', $config['secret']);
    }

<<<<<<< HEAD
    public function testEmptySecretThrows()
=======
    public function testEmptySecretThrows(): void
>>>>>>> upstream/3.x
    {
        $this->expectException(InvalidConfigurationException::class);
        $this->expectExceptionMessage('The path "live_component.secret" cannot contain an empty value, but got null.');

        $processor = new Processor();
        $config = $processor->processConfiguration(new LiveComponentExtension(), [
            'live_component' => [
                'secret' => null,
            ],
        ]);
    }

<<<<<<< HEAD
    public function testCustomSecret()
=======
    public function testCustomSecret(): void
>>>>>>> upstream/3.x
    {
        $processor = new Processor();
        $config = $processor->processConfiguration(new LiveComponentExtension(), [
            'live_component' => [
                'secret' => 'my_secret',
            ],
        ]);

        $this->assertEquals('my_secret', $config['secret']);
    }
}
