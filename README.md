# anti-adblock-defuser

[⭐ Star this repo ⭐](https://github.com/chirag127/userscripts)

Beats "please disable your adblocker" walls without whitelisting the site.

## Install

[Click here to install in ScriptCat](https://raw.githubusercontent.com/chirag127/anti-adblock-defuser-userscript/main/anti-adblock-defuser.user.js)

## How it works

1. Pre-sets the globals the common detector libraries read (`canRunAds`, `adblockDetected`, `adsbygoogle`).
2. Inserts a 300×250 bait ad slot so pixel-measuring detectors find an ad.
3. Sweeps for overlays whose text mentions adblock and that are fixed or larger than 40% of the viewport, removes them, and restores scroll.

## Limits

Detectors that probe a real network request to an ad domain, or that run before `document-start`, can still win. Video players with their own adblock checks are not covered.

## License

MIT. See [LICENSE](../../LICENSE).
