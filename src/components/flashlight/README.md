# Flashlight handoff for RICKS

Ready for the Stage 06 seat map. Existing props are unchanged:

```jsx
import Flashlight from "../../components/flashlight/Flashlight.jsx";

<Flashlight on={dark} radius={120}>
  {/* Seat map and its controls */}
</Flashlight>
```

The overlay covers only its children. Mouse movement and touch/pointer presses aim the circle; keyboard focus lights the focused control. Pointer events pass through the overlay, so seats remain clickable. The default radius is 120px. When `on` is false, the overlay and scroll/resize listeners are removed without remounting children.

The beam now fades softly at its edges. Add `fullPage` to darken the entire viewport, including the app shell and native dialogs. This additive prop defaults to `false`, preserving the Stage 06 child-only behaviour. Page mode listens for pointer/touch and keyboard focus throughout the document, and removes its overlay/listeners when disabled or unmounted.

Keep an accessible light/skip toggle. Stage 03 provides a page-wide example at `/?stage=3`, with Escape restoring the lights (Escape closes an open tourism dialog first).
