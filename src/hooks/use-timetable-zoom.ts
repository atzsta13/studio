'use client';

import { useCallback, useEffect, useState } from 'react';

export const BASE_PX_PER_MIN = 2.4;
export const BASE_COL_PX = 200;
export const GUTTER_PX = 52;
/** Height of the grid's sticky stage-header row. */
export const HEADER_PX = 44;

// The floor is deliberately low: at ~10% an 18-stage, 16-hour Sziget day fits
// on a phone screen as blocks, which is the whole point of zooming out.
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 2.6;
export const ZOOM_STEP = 1.3;

export function clampZoom(zoom: number): number {
    if (!Number.isFinite(zoom)) return 1;
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

interface AnchorArgs {
    prevZoom: number;
    nextZoom: number;
    /** Focal point in container-viewport coordinates (px from the container's top-left). */
    focalX: number;
    focalY: number;
    scrollLeft: number;
    scrollTop: number;
    gutterPx?: number;
}

/**
 * Scroll offsets that keep the content under the focal point in place across a
 * zoom change. The vertical axis scales entirely; horizontally the time gutter
 * is a fixed-width column that does not scale, so it is subtracted first.
 */
export function anchoredScroll({
    prevZoom,
    nextZoom,
    focalX,
    focalY,
    scrollLeft,
    scrollTop,
    gutterPx = GUTTER_PX,
}: AnchorArgs): { scrollLeft: number; scrollTop: number } {
    const ratio = prevZoom > 0 ? nextZoom / prevZoom : 1;
    const contentY = scrollTop + focalY;
    const contentX = scrollLeft + focalX - gutterPx;
    return {
        scrollLeft: Math.max(0, contentX * ratio + gutterPx - focalX),
        scrollTop: Math.max(0, contentY * ratio - focalY),
    };
}

interface FitArgs {
    containerWidth: number;
    containerHeight: number;
    stageCount: number;
    totalMinutes: number;
    gutterPx?: number;
    /** Overridable only for tests; defaults to the real header height. */
    headerPx?: number;
}

/** Largest zoom at which the whole day (all stages, all hours) fits on screen. */
export function fitZoom({
    containerWidth,
    containerHeight,
    stageCount,
    totalMinutes,
    gutterPx = GUTTER_PX,
    headerPx = HEADER_PX,
}: FitArgs): number {
    // An axis that cannot be measured yet (container not laid out) must not
    // decide the fit, and if neither can be measured we leave the zoom alone.
    const widthFit = stageCount > 0 && containerWidth > gutterPx
        ? (containerWidth - gutterPx) / (stageCount * BASE_COL_PX)
        : Infinity;
    const heightFit = totalMinutes > 0 && containerHeight > headerPx
        ? (containerHeight - headerPx) / (totalMinutes * BASE_PX_PER_MIN)
        : Infinity;
    const fit = Math.min(widthFit, heightFit);
    return Number.isFinite(fit) ? clampZoom(fit) : 1;
}

/** Largest zoom at which every stage column is visible without horizontal scroll. */
export function fitWidthZoom(containerWidth: number, stageCount: number, gutterPx = GUTTER_PX): number {
    if (stageCount <= 0 || containerWidth <= gutterPx) return 1;
    return clampZoom((containerWidth - gutterPx) / (stageCount * BASE_COL_PX));
}

/**
 * Density tier for a card, derived from its rendered pixel height rather than
 * its duration — under zoom the same set can be 400px or 20px tall.
 */
export function densityTier(pxHeight: number): 'tiny' | 'small' | 'full' {
    if (pxHeight < 46) return 'tiny';
    if (pxHeight < 78) return 'small';
    return 'full';
}

/**
 * Zoom state for the timetable grid, persisted per festival so a user's
 * preferred density survives navigation and offline reloads.
 */
export function useTimetableZoom(festivalId: string, initial = 1) {
    const storageKey = `${festivalId}-timetable-zoom`;
    const [zoom, setZoomState] = useState(() => clampZoom(initial));
    const [hydrated, setHydrated] = useState(false);
    const [hadStored, setHadStored] = useState(false);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(storageKey);
            const parsed = stored === null ? NaN : Number.parseFloat(stored);
            if (Number.isFinite(parsed)) {
                setZoomState(clampZoom(parsed));
                setHadStored(true);
            }
        } catch {
            /* storage unavailable — keep the default */
        }
        setHydrated(true);
    }, [storageKey]);

    const setZoom = useCallback((next: number | ((current: number) => number)) => {
        setZoomState(current => {
            const raw = typeof next === 'function' ? next(current) : next;
            const clamped = clampZoom(raw);
            try {
                window.localStorage.setItem(storageKey, String(clamped));
            } catch {
                /* storage unavailable — zoom stays in-memory only */
            }
            return clamped;
        });
    }, [storageKey]);

    /**
     * Zoom change that is NOT remembered — used for the automatic fit, so a
     * fitted default never masquerades as a preference the user chose.
     */
    const setZoomTransient = useCallback((next: number) => {
        setZoomState(clampZoom(next));
    }, []);

    return { zoom, setZoom, setZoomTransient, hydrated, hadStored };
}
