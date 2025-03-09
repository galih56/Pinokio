<?php 
namespace App\Helpers;

class ColorGenerator {
    public static function generateHex() {
        $hue = rand(0, 360);
        $saturation = rand(50, 100);
        $lightness = rand(40, 70);

        return self::hslToHex($hue, $saturation, $lightness);
    }

    private static function hslToHex($h, $s, $l) {
        $s /= 100;
        $l /= 100;

        $c = (1 - abs(2 * $l - 1)) * $s;
        $x = $c * (1 - abs(fmod($h / 60, 2) - 1));
        $m = $l - ($c / 2);

        if ($h < 60) { $r = $c; $g = $x; $b = 0; }
        elseif ($h < 120) { $r = $x; $g = $c; $b = 0; }
        elseif ($h < 180) { $r = 0; $g = $c; $b = $x; }
        elseif ($h < 240) { $r = 0; $g = $x; $b = $c; }
        elseif ($h < 300) { $r = $x; $g = 0; $b = $c; }
        else { $r = $c; $g = 0; $b = $x; }

        $r = dechex(round(($r + $m) * 255));
        $g = dechex(round(($g + $m) * 255));
        $b = dechex(round(($b + $m) * 255));

        return sprintf("#%02s%02s%02s", $r, $g, $b);
    }
}
