"use client";;
import { AnimatePresence } from "motion/react";
import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { TooltipSurface } from "@/components/motion/tooltip-surface";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverGesture } from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { cn } from "@/lib/utils";
import { focusFromKeyboard, graceArea, inBox, inPolygon, watchModality } from "./tooltip/grace";
import { TooltipArrow, TooltipPositioner } from "./tooltip/positioner";
import { useTooltipPointer } from "./tooltip/use-position";

const TimingContext = createContext({ delay: 120, closeDelay: 0, skipDelay: 300 });

/** Shared timing for every tooltip inside it. Optional: tooltips work without one. */
export function TooltipProvider({
  children,
  ...timing
}) {
  const parent = useContext(TimingContext);
  const { delay = parent.delay, closeDelay = parent.closeDelay, skipDelay = parent.skipDelay } =
    timing;
  const value = useMemo(() => ({ delay, closeDelay, skipDelay }), [delay, closeDelay, skipDelay]);
  return <TimingContext.Provider value={value}>{children}</TimingContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/* Root                                                                       */
/* -------------------------------------------------------------------------- */

// Moving along a toolbar should feel instant after the first label, and only
// one label may show at a time: a keyboard-focused control and a hovered one
// would otherwise both claim the screen.
let lastClosedAt = 0;
let current = null;

function isEmpty(content) {
  return content == null || content === false || content === "";
}

const TooltipContext = createContext(null);

function useTooltipContext(part) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error(`${part} must be used inside <Tooltip>`);
  return context;
}

function TooltipRoot({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delay: delayProp,
  closeDelay: closeDelayProp,
  disabled = false,
  asLabel = false,
  followCursor = false,
  anchorRef,
  id,
  initialEmpty = false
}) {
  const timing = useContext(TimingContext);
  const delay = delayProp ?? timing.delay;
  const closeDelay = closeDelayProp ?? timing.closeDelay;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const [empty, setEmpty] = useState(initialEmpty);
  const [trigger, setTrigger] = useState(null);
  const [external, setExternal] = useState(null);
  const anchor = anchorRef ? external : trigger;
  const generatedId = useId();
  const contentId = id ?? `${generatedId}-content`;
  const labelId = `${generatedId}-label`;
  const floatingRef = useRef(null);
  const anchorObject = useRef(null);
  const pointer = useTooltipPointer(anchor, followCursor);

  // An external ref can attach after this component renders; read it once it has.
  useLayoutEffect(() => {
    if (!anchorRef) return;
    const element = anchorRef.current ?? null;
    if (element !== external) setExternal(element);
  });

  // Everything the event listeners read, current without re-binding them.
  const latest = useRef({ open, delay, closeDelay, disabled, empty, onOpenChange, controlled: false });
  useLayoutEffect(() => {
    anchorObject.current = anchor;
    latest.current = {
      open,
      delay,
      closeDelay,
      disabled,
      empty,
      onOpenChange,
      controlled: controlledOpen !== undefined,
    };
  });

  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const grace = useRef(null);
  const self = useRef({ close: () => {} });

  const clearTimers = useCallback(() => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    openTimer.current = null;
    closeTimer.current = null;
  }, []);

  const stopGrace = useCallback(() => {
    grace.current?.();
    grace.current = null;
  }, []);

  // Only a real change reaches the consumer: a pointer leaving a closed
  // tooltip is not news.
  const commit = useCallback((next) => {
    if (latest.current.open === next) return;
    if (!latest.current.controlled) setUncontrolledOpen(next);
    latest.current.onOpenChange?.(next);
  }, []);

  const openNow = useCallback(() => {
    clearTimers();
    stopGrace();
    if (latest.current.disabled || latest.current.empty) return;
    if (current && current !== self.current) current.close();
    current = self.current;
    commit(true);
  }, [clearTimers, stopGrace, commit]);

  const close = useCallback(() => {
    clearTimers();
    stopGrace();
    if (latest.current.open) lastClosedAt = Date.now();
    if (current === self.current) current = null;
    commit(false);
  }, [clearTimers, stopGrace, commit]);
  useLayoutEffect(() => {
    self.current.close = close;
  }, [close]);

  const requestOpen = useCallback(() => {
    clearTimers();
    if (latest.current.open || latest.current.disabled || latest.current.empty) return;
    const warm = Date.now() - lastClosedAt < timing.skipDelay;
    if (warm || latest.current.delay <= 0) openNow();
    else openTimer.current = setTimeout(openNow, latest.current.delay);
  }, [clearTimers, openNow, timing.skipDelay]);

  const requestClose = useCallback(() => {
    clearTimers();
    if (latest.current.closeDelay > 0) {
      closeTimer.current = setTimeout(close, latest.current.closeDelay);
    } else close();
  }, [clearTimers, close]);

  // Hold the label open while the pointer crosses from one box toward the other.
  const startGrace = useCallback(
    (exit, from, to) => {
      stopGrace();
      if (!to) return requestClose();
      const target = to.getBoundingClientRect();
      const origin = from.getBoundingClientRect();
      const corridor = graceArea(exit, target);
      const onMove = (event) => {
        const point = { x: event.clientX, y: event.clientY };
        if (inBox(point, target) || inBox(point, origin)) return;
        if (!inPolygon(point, corridor)) requestClose();
      };
      document.addEventListener("pointermove", onMove);
      grace.current = () => document.removeEventListener("pointermove", onMove);
    },
    [stopGrace, requestClose],
  );

  const hover = useHoverGesture();
  const tap = useTapGesture();

  // Listeners go on the trigger itself rather than on cloned props, so a
  // component that owns its own handlers keeps them, and no wrapper element
  // sits between the control and its layout.
  useEffect(() => {
    if (anchorRef || !trigger) return;
    watchModality();
    // A mouse press dismisses the label and keeps it away until the pointer
    // leaves; hovering a control you just clicked should not bring it back.
    let suppressed = false;
    // Focus that came from the keyboard holds the label open on its own.
    let keyboardFocus = false;

    const onEnter = (event) => {
      if (!hover.enter(event)) return;
      stopGrace();
      if (closeTimer.current) clearTimeout(closeTimer.current);
      if (!suppressed) requestOpen();
    };
    const onLeave = (event) => {
      if (!hover.leave(event)) return;
      suppressed = false;
      if (keyboardFocus) return;
      if (openTimer.current) {
        clearTimers();
        return;
      }
      if (latest.current.open && !followCursor) {
        startGrace({ x: event.clientX, y: event.clientY }, trigger, floatingRef.current);
      } else requestClose();
    };
    const onDown = (event) => {
      tap.start(event, latest.current.open);
      if (event.pointerType === "mouse") {
        suppressed = true;
        close();
      }
    };
    // A finger never hovers, and Safari does not focus a button on tap either,
    // so the label is only reachable if the tap itself toggles it. The click
    // carries no pointerType; the pointerdown before it says whether it was a
    // tap, and keyboard activation has none at all.
    const onClick = () => {
      const gesture = tap.take();
      if (!gesture || gesture.pointerType === "mouse") return;
      if (gesture.state) close();
      else openNow();
    };
    const onKey = () => tap.drop();
    const onFocusIn = () => {
      if (!focusFromKeyboard()) return;
      keyboardFocus = true;
      openNow();
    };
    const onFocusOut = (event) => {
      if (trigger.contains(event.relatedTarget)) return;
      keyboardFocus = false;
      close();
    };

    // Both element kinds dispatch the same events; one type keeps the listeners typed.
    const el = trigger;
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointercancel", tap.drop);
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKey);
    el.addEventListener("focusin", onFocusIn);
    el.addEventListener("focusout", onFocusOut);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointercancel", tap.drop);
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("focusin", onFocusIn);
      el.removeEventListener("focusout", onFocusOut);
    };
  }, [
    anchorRef,
    trigger,
    followCursor,
    hover,
    tap,
    requestOpen,
    requestClose,
    openNow,
    close,
    clearTimers,
    stopGrace,
    startGrace,
  ]);

  // While open, a trigger that turns disabled loses focus without a blur event,
  // and a window that loses focus never reports the pointer leaving.
  useEffect(() => {
    if (!open || anchorRef || !trigger) return;
    const observer = new MutationObserver(() => {
      if (trigger.matches(":disabled, [aria-disabled='true']")) close();
    });
    observer.observe(trigger, { attributes: true, attributeFilter: ["disabled", "aria-disabled"] });
    window.addEventListener("blur", close);
    return () => {
      observer.disconnect();
      window.removeEventListener("blur", close);
    };
  }, [open, anchorRef, trigger, close]);

  // A chart drives its own open state and swaps content as it goes; only a
  // trigger-owned label closes itself for having nothing to say.
  useEffect(() => {
    if (disabled || (empty && !anchorRef)) close();
  }, [disabled, empty, anchorRef, close]);

  useEffect(
    () => () => {
      clearTimers();
      stopGrace();
      if (current === self.current) current = null;
    },
    [clearTimers, stopGrace],
  );

  const insideTooltip = useCallback(
    (target) => Boolean(floatingRef.current?.contains(target)),
    [],
  );
  // ...and closed by the next tap that lands somewhere else, or Escape. The
  // label covers nothing interactive, so that tap passes through to what it hit.
  useDismiss(open, close, anchorObject, { ignore: insideTooltip });

  const onContentEnter = useCallback(() => {
    stopGrace();
    clearTimers();
  }, [stopGrace, clearTimers]);

  const onContentLeave = useCallback(
    (event) => {
      const floating = floatingRef.current;
      if (!floating) return;
      if (anchorRef) {
        // Bridge the small gap back onto a chart; it reopens on its own terms.
        clearTimers();
        closeTimer.current = setTimeout(close, 100);
        return;
      }
      startGrace({ x: event.clientX, y: event.clientY }, floating, anchorObject.current);
    },
    [anchorRef, clearTimers, close, startGrace],
  );

  const value = useMemo(() => ({
    open,
    contentId,
    labelId,
    asLabel,
    empty,
    followCursor,
    anchor,
    triggered: !anchorRef,
    floatingRef,
    pointer,
    setTrigger,
    setEmpty,
    close,
    onContentEnter,
    onContentLeave,
  }), [
    open,
    contentId,
    labelId,
    asLabel,
    empty,
    followCursor,
    anchor,
    anchorRef,
    pointer,
    close,
    onContentEnter,
    onContentLeave,
  ]);

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/* Trigger                                                                    */
/* -------------------------------------------------------------------------- */

function mergeIds(...ids) {
  return ids.filter((value) => typeof value === "string" && value).join(" ") || undefined;
}

function assignRef(ref, value) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref).current = value;
}

export function TooltipTrigger({
  asChild = false,
  children,
  ref,
  ...props
}) {
  const { open, contentId, labelId, asLabel, empty, setTrigger } =
    useTooltipContext("TooltipTrigger");
  const child = asChild && isValidElement(children) ? children : null;
  const childProps = (child?.props ?? props);
  const childRef = child ? (childProps.ref) : undefined;
  const attached = useRef(null);

  const setRef = useCallback(
    (element) => {
      attached.current = element;
      setTrigger(element);
      assignRef(childRef ?? (ref), element);
    },
    [setTrigger, childRef, ref],
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && child && !attached.current) {
      console.warn(
        "TooltipTrigger: the child did not attach a ref, so the tooltip has nothing to listen to. Render a DOM element or a component that passes `ref` through.",
      );
    }
  }, [child]);

  const aria = asLabel
    ? {
        "aria-labelledby": empty
          ? (childProps["aria-labelledby"])
          : labelId,
      }
    : {
        "aria-describedby": mergeIds(
          childProps["aria-describedby"],
          open && !empty ? contentId : undefined,
        ),
      };

  if (asChild) {
    if (!child) return children;
    return cloneElement(child, { ref: setRef, ...aria });
  }

  return (
    <button
      type="button"
      data-state={open ? "open" : "closed"}
      {...props}
      ref={setRef}
      {...aria}
    >
      {children}
    </button>
  );
}

export function TooltipContent({
  children,
  side = "top",
  align = "center",
  sideOffset,
  arrow = false,
  anchorPoint,
  className
}) {
  const {
    open,
    contentId,
    labelId,
    asLabel,
    followCursor,
    anchor,
    floatingRef,
    pointer,
    setEmpty,
    close,
    onContentEnter,
    onContentLeave,
  } = useTooltipContext("TooltipContent");
  const empty = isEmpty(children);
  const arrowRef = useRef(null);

  useLayoutEffect(() => {
    setEmpty(empty);
  }, [empty, setEmpty]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* The name has to exist while the label is closed, so it lives apart from the surface. */}
      {asLabel && !empty ? (
        <span id={labelId} hidden>
          {children}
        </span>
      ) : null}
      <AnimatePresence>
        {open && !empty ? (
          <TooltipPositioner
            key="tooltip"
            anchor={anchor}
            floatingRef={floatingRef}
            arrowRef={arrow ? arrowRef : undefined}
            anchorPoint={anchorPoint}
            followCursor={followCursor}
            side={side}
            align={align}
            sideOffset={sideOffset}
            onDismiss={close}
            pointer={pointer}
          >
            {(positioned, isPresent, placedSide) => (
              <TooltipSurface
                id={asLabel ? undefined : contentId}
                aria-hidden={asLabel || undefined}
                ready={positioned}
                onPointerEnter={onContentEnter}
                onPointerLeave={onContentLeave}
                style={{ pointerEvents: isPresent && !followCursor ? "auto" : "none" }}
                className={cn(
                  "max-w-[min(20rem,calc(100vw-16px))] whitespace-normal break-words",
                  arrow && "relative",
                  className,
                )}
              >
                {children}
                {arrow ? <TooltipArrow ref={arrowRef} side={placedSide} /> : null}
              </TooltipSurface>
            )}
          </TooltipPositioner>
        ) : null}
      </AnimatePresence>
    </>,
    document.body,
  );
}

export function Tooltip(props) {
  if (!("content" in props)) return <TooltipRoot {...props} />;
  const {
    content,
    children,
    side,
    align,
    sideOffset,
    arrow,
    anchorPoint,
    className,
    ...root
  } = props;
  if (!root.anchorRef && !isValidElement(children)) return children ?? null;
  return (
    <TooltipRoot {...root} initialEmpty={isEmpty(content)}>
      {isValidElement(children) ? <TooltipTrigger>{children}</TooltipTrigger> : null}
      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        arrow={arrow}
        anchorPoint={anchorPoint}
        className={className}
      >
        {content}
      </TooltipContent>
    </TooltipRoot>
  );
}
