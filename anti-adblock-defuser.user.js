// ==UserScript==
// @name         Anti-Adblock Defuser
// @namespace    https://github.com/chirag127/userscripts
// @version      1.0.0
// @description  Beats adblock detectors: pre-sets the flags blockAdBlock and friends read, fakes an ad slot, then removes "disable your adblocker" overlays and unfreezes the page. ScriptCat switch, on by default.
// @author       chirag127
// @match        *://*/*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_log
// @grant        CAT_registerMenuInput
// @license      MIT
// @homepageURL  https://github.com/chirag127/userscripts/tree/main/scripts/anti-adblock-defuser
// @supportURL   https://github.com/chirag127/userscripts/issues
// @updateURL    https://raw.githubusercontent.com/chirag127/userscripts/main/scripts/anti-adblock-defuser/anti-adblock-defuser.user.js
// @downloadURL  https://raw.githubusercontent.com/chirag127/userscripts/main/scripts/anti-adblock-defuser/anti-adblock-defuser.user.js
// ==/UserScript==

(() => {
  'use strict'

  const W = typeof unsafeWindow === 'undefined' ? window : unsafeWindow
  const site = location.hostname
  const enabled = GM_getValue(`on:${site}`, true)
  if (!enabled) return
  if (window.top !== window) return

  const log = (m) => {
    try {
      GM_log(`[adblock-defuse] ${m}`)
    } catch {}
  }

  // ---- flags the common detector libraries read ---------------------------
  W.canRunAds = true
  W.canRunAdsAsync = true
  W.adblockDetected = false
  W.adBlockDetected = false
  W.isAdBlockActive = false
  W.adsbygoogle = W.adsbygoogle || []
  W.adsbygoogle.push = function () {}

  // bait element: detectors measure this and declare "no ads" when it is 0px
  try {
    const bait = document.createElement('div')
    bait.id = 'ad-banner'
    bait.className = 'adsbox ad-banner ad unit'
    bait.style.cssText =
      'position:absolute;top:-9999px;left:-9999px;width:300px;height:250px;pointer-events:none'
    bait.innerHTML = '<ins class="adsbygoogle"></ins>'
    ;(document.documentElement || document).append(bait)
  } catch (e) {
    log(`bait: ${e}`)
  }

  const OVERLAY =
    '[id*="adblock" i],[class*="adblock" i],[id*="ad-block" i],[class*="ad-block" i],' +
    '[id*="blockadblock" i],[class*="blockadblock" i],[id*="adblocker" i],[class*="adblocker" i]'

  const unlock = () => {
    for (const el of [document.documentElement, document.body]) {
      if (!el) continue
      if (el.style.overflow === 'hidden') el.style.overflow = 'auto'
      if (el.style.position === 'fixed') el.style.position = ''
    }
  }

  let removed = 0
  const sweep = () => {
    unlock()
    for (const el of document.querySelectorAll(OVERLAY)) {
      const s = getComputedStyle(el)
      const fixed = s.position === 'fixed'
      const big = el.getBoundingClientRect().width > window.innerWidth * 0.4
      const text = (el.textContent || '').slice(0, 400)
      if (!/adblock|ad blocker|werbeblocker|bloqueur/i.test(text)) continue
      if (fixed || big) {
        el.remove()
        removed++
      }
    }
  }

  let timer
  const schedule = () => {
    clearTimeout(timer)
    timer = setTimeout(sweep, 150)
  }

  const ready = (fn) =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn()

  ready(() => {
    schedule()
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true })
    setTimeout(() => log(`removed ${removed} overlay(s)`), 4000)
  })

  const switchMenu = (label, key, value, title) => {
    const listener = (next) => {
      GM_setValue(key, next === undefined ? !value : !!next)
      location.reload()
    }
    if (typeof CAT_registerMenuInput === 'function') {
      CAT_registerMenuInput(label, listener, {
        id: `abd:${key}`,
        inputType: 'boolean',
        inputDefaultValue: value,
        title,
        inputLabel: label,
      })
    }
  }
  switchMenu(`Defuse adblock walls on ${site}`, `on:${site}`, enabled, 'Remove adblock-detected overlays')
})()
