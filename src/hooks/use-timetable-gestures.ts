'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { anchoredScroll, clampZoom, ZOOM_STEP } from './use-timetable-zoom';

interface GestureArgs {
    containerRef: React.RefObject<HTMLDivElement | null>;
    zoom: number;
    setZoom: (next: number | ((current: number) => number)) => void;
    gutterPx: number;
    enabled?: boolean;
}

function touchDistance(a: Touch, b: Touch): number {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Two-finger pinch, ctrl/⌘+wheel, double-tap and drag-to-pan on the grid.
 *
 * Zoom is anchored: the minute + stage under the pinch midpoint (or cursor)
 * stays put. Because the DOM only reflects the new scale after React commits,
 * the target scroll offsets are staged in a ref and applied in a layout effect.
 */
export function useTimetableGestures({ containerRef, zoom, setZoom, gutterPx, enabled = true }: GestureArgs) {
    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;
    const pendingScroll = useRef<{ scrollLeft: number; scrollTop: number } | null>(null);
    const [isPanning, setIsPanning] = useState(false);

    useLayoutEffect(() => {
        const el = containerRef.current;
        const target = pendingScroll.current;
        if (!el || !target) return;
        pendingScroll.current = null;
        el.scrollLeft = target.scrollLeft;
        el.scrollTop = target.scrollTop;
    }, [zoom, containerRef]);

    const zoomToward = useCallback((factor: number, clientX: number, clientY: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const prevZoom = zoomRef.current;
        const nextZoom = clampZoom(prevZoom * factor);
        if (nextZoom === prevZoom) return;
        pendingScroll.current = anchoredScroll({
            prevZoom,
            nextZoom,
            focalX: clientX - rect.left,
            focalY: clientY - rect.top,
            scrollLeft: el.scrollLeft,
            scrollTop: el.scrollTop,
            gutterPx,
        });
        setZoom(nextZoom);
    }, [containerRef, gutterPx, setZoom]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el || !enabled) return;

        // Trackpad pinch arrives as a ctrl-modified wheel event in every
        // current browser; a real ctrl+wheel from a mouse means the same intent.
        const onWheel = (e: WheelEvent) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const factor = Math.exp(-e.deltaY / 180);
            zoomToward(factor, e.clientX, e.clientY);
        };

        let pinchStartDistance = 0;
        let pinchStartZoom = 1;

        const onTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 2) return;
            pinchStartDistance = touchDistance(e.touches[0], e.touches[1]);
            pinchStartZoom = zoomRef.current;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (e.touches.length !== 2 || pinchStartDistance === 0) return;
            e.preventDefault();
            const distance = touchDistance(e.touches[0], e.touches[1]);
            const target = clampZoom(pinchStartZoom * (distance / pinchStartDistance));
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            zoomToward(target / zoomRef.current, midX, midY);
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (e.touches.length < 2) pinchStartDistance = 0;
        };

        const onDoubleClick = (e: MouseEvent) => {
            if ((e.target as HTMLElement | null)?.closest('[data-no-pan]')) return;
            e.preventDefault();
            zoomToward(e.altKey ? 1 / ZOOM_STEP : ZOOM_STEP, e.clientX, e.clientY);
        };

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchmove', onTouchMove, { passive: false });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
        el.addEventListener('touchcancel', onTouchEnd, { passive: true });
        el.addEventListener('dblclick', onDoubleClick);

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('touchstart', onTouchStart);
            el.removeEventListener('touchmove', onTouchMove);
            el.removeEventListener('touchend', onTouchEnd);
            el.removeEventListener('touchcancel', onTouchEnd);
            el.removeEventListener('dblclick', onDoubleClick);
        };
    }, [containerRef, enabled, zoomToward]);

    // Mouse drag panning, so a desktop user can move diagonally in one gesture
    // instead of fighting two scrollbars. Ignores drags that start on a card.
    useEffect(() => {
        const el = containerRef.current;
        if (!el || !enabled) return;

        let active = false;
        let startX = 0;
        let startY = 0;
        let startScrollLeft = 0;
        let startScrollTop = 0;
        let moved = false;

        const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse' || e.button !== 0) return;
            if ((e.target as HTMLElement | null)?.closest('[data-no-pan]')) return;
            active = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            startScrollLeft = el.scrollLeft;
            startScrollTop = el.scrollTop;
        };

        const onPointerMove = (e: PointerEvent) => {
            if (!active) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (!moved && Math.hypot(dx, dy) < 4) return;
            if (!moved) {
                moved = true;
                setIsPanning(true);
            }
            el.scrollLeft = startScrollLeft - dx;
            el.scrollTop = startScrollTop - dy;
        };

        const onPointerUp = () => {
            if (!active) return;
            active = false;
            if (moved) setIsPanning(false);
        };

        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
        };
    }, [containerRef, enabled]);

    return { isPanning };
}
