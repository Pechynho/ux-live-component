<?php

/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

namespace Symfony\UX\LiveComponent\Tests\Unit\Metadata;

use PHPUnit\Framework\TestCase;
use Symfony\UX\LiveComponent\Attribute\LiveProp;
use Symfony\UX\LiveComponent\Metadata\LivePropMetadata;

class LivePropMetadataTest extends TestCase
{
<<<<<<< HEAD
    public function testWithModifier()
=======
    public function testWithModifier(): void
>>>>>>> upstream/3.x
    {
        $liveProp = new LiveProp(modifier: 'modifyProp');
        $livePropMetadata = new LivePropMetadata('propWithModifier', $liveProp, null, false, false, null);

        $component = new class {
            public function modifyProp(LiveProp $liveProp, string $propertyName): LiveProp
            {
                return $liveProp->withFieldName('customField');
            }
        };

        $livePropMetadata = $livePropMetadata->withModifier($component);

        $this->assertEquals('customField', $livePropMetadata->calculateFieldName($component, 'propWithModifier'));
    }

<<<<<<< HEAD
    public function testWithModifierThrowsErrorIfNoMethodExistsInComponent()
=======
    public function testWithModifierThrowsErrorIfNoMethodExistsInComponent(): void
>>>>>>> upstream/3.x
    {
        $liveProp = new LiveProp(modifier: 'modifyProp');
        $livePropMetadata = new LivePropMetadata('propWithModifier', $liveProp, null, false, false, null);

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessageMatches('/Method ".*::modifyProp\(\)" given in LiveProp "modifier" does not exist\./');

        $livePropMetadata->withModifier(new \stdClass());
    }

<<<<<<< HEAD
    public function testWithModifierThrowsAnErrorIfModifierMethodDoesNotReturnLiveProp()
=======
    public function testWithModifierThrowsAnErrorIfModifierMethodDoesNotReturnLiveProp(): void
>>>>>>> upstream/3.x
    {
        $liveProp = new LiveProp(modifier: 'modifyProp');
        $livePropMetadata = new LivePropMetadata('propWithModifier', $liveProp, null, false, false, null);

        $component = new class {
            public function modifyProp(LiveProp $liveProp, string $propertyName)
            {
                return false;
            }
        };

        $this->expectException(\LogicException::class);
        $this->expectExceptionMessageMatches(\sprintf('/Method ".*::modifyProp\(\)" should return an instance of "%s" \(given: "bool"\)\./', preg_quote(LiveProp::class)));
        $livePropMetadata->withModifier($component);
    }
}
