# Flashlight handoff for RICKS

Ready for the Stage 06 seat map. Existing props are unchanged:

```jsx
import Flashlight from "../../components/flashlight/Flashlight.jsx";

<Flashlight on={dark} radius={120}>
  {/* Seat map and its controls */}
</Flashlight>
```

The overlay covers only its children. Mouse movement and touch/pointer presses aim the circle; keyboard focus lights the focused control. Pointer events pass through the overlay, so seats remain clickable. The default radius is 120px. When `on` is false, the overlay and scroll/resize listeners are removed without remounting children.

Keep an accessible light/skip toggle outside this wrapper. Stage 03 provides a working example at `/?stage=3`.
