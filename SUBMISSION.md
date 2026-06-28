# Even Hub — Quick Tip

## Package

| Field | Value |
|-------|-------|
| **File** | `quick-tip.ehpk` |
| **Package ID** | `dev.quicktip.g2` |
| **Version** | `1.0.0` |
| **Name** | Quick Tip |

## Short description (≤50 chars)

Tip calculator & bill splitter for G2.

## Long description

**Quick Tip** is a dining-out utility for Even Realities G2 glasses and the R1 ring.

Set your **bill amount**, **tip percentage**, and **party size**, then see tip amount, grand total, and **per-person share** on the HUD instantly. Tap menu rows to cycle common presets ($20–$200 bills, 15–25% tips, 1–8 guests). **Adjust Values** gives fine control in $5 and ±1% steps.

Perfect for restaurants when you want the math in your periphery without opening a calculator app.

**Controls:** Scroll menu, tap to select. Double-tap to exit.

No network. No permissions.

## Tags

```
tip
calculator
dining
money
utility
split
bill
R1
G2
finance
```

## Permissions

**None required.**


## Hub upload (required)

These builds do **not** appear under the Even Hub tab QR / dev sideload area. Follow this flow:

1. Sign in at [hub.evenrealities.com](https://hub.evenrealities.com/) with the **same account** as your iPhone Even app.
2. **Create a new project** (or open existing) with `package_id` exactly: `dev.quicktip.g2`
3. Fill store metadata: name, descriptions, tags, **monochrome icon** (`media/icon-foreground.png` + `media/icon-background.png`), screenshots from `media/`.
4. Open **Private builds** tab → upload `quick-tip.ehpk` from the project root.
5. On iPhone: force-quit Even app, reopen → **Me → Apps → Private builds** → Install.

## Update notes (v1.0.1)

v1.0.1: Rebuilt .ehpk for Even Hub Private builds (SDK 0.0.11, CLI 0.1.13). Fixed adjust-values flow and Back navigation. Pack output verified at project root. After hub upload to Private builds, install on phone via Me → Apps → Private builds.
