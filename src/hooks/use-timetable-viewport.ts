'use client';

import { useEffect, useRef, useState } from 'react';

/** Global site header: `h-14` / `md:h-18` in `header.tsx`. */
const TOP_INSET_NARROW = 56;
const TOP_INSET_WIDE = 72;
/** Fixed bottom navigation: 72px + border, rendered below MUI's `md`. */
const BOTTOM_INSET_WITH_NAV = 76;
const BOTTOM_INSET_BARE = 16;

/**
 * Sizes the timetable board to the screen space its own chrome leaves over, and
 * keeps its sticky stage header visible.
 *
 * Three things have to agree or that header slides out of sight behind the
 * toolbar: the toolbar pins below the global site header (`topInset`), the board
 * is capped to `100dvh` minus all the chrome, and no ancestor is taller than
 * that (a `min-h-screen` above the grid is scroll slack that drags the board up).
 * Page padding outside this component can still leave a few pixels of slack, so
 * the header's sticky offset is the *measured* toolbar/board overlap rather than
 * zero — that holds no matter what the page above the grid does.
 */
export function useTimetableViewport(boardRef: React.RefObject<HTMLDivElement | null>, toolbarRows: number) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [toolbarHeight, setToolbarHeight] = useState(0);
    const [topInset, setTopInset] = useState(TOP_INSET_NARROW);
    const [bottomInset, setBottomInset] = useState(BOTTOM_INSET_BARE);
    const [stickyHeaderTop, setStickyHeaderTop] = useState(0);

    useEffect(() => {
        const el = toolbarRef.current;
        if (!el || typeof ResizeObserver === 'undefined') return;
        setToolbarHeight(el.offsetHeight);
        const observer = new ResizeObserver(([entry]) => setToolbarHeight(entry.contentRect.height));
        observer.observe(el);
        return () => observer.disconnect();
    }, [toolbarRows]);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') return;
        const wide = window.matchMedia('(min-width: 768px)');
        const withoutBottomNav = window.matchMedia('(min-width: 900px)');
        const apply = () => {
            setTopInset(wide.matches ? TOP_INSET_WIDE : TOP_INSET_NARROW);
            setBottomInset(withoutBottomNav.matches ? BOTTOM_INSET_BARE : BOTTOM_INSET_WITH_NAV);
        };
        apply();
        wide.addEventListener('change', apply);
        withoutBottomNav.addEventListener('change', apply);
        return () => {
            wide.removeEventListener('change', apply);
            withoutBottomNav.removeEventListener('change', apply);
        };
    }, []);

    useEffect(() => {
        let frame = 0;
        const measure = () => {
            frame = 0;
            const board = boardRef.current;
            const toolbar = toolbarRef.current;
            if (!board || !toolbar) return;
            const overlap = toolbar.getBoundingClientRect().bottom - board.getBoundingClientRect().top;
            setStickyHeaderTop(prev => {
                const next = Math.max(0, Math.round(overlap));
                return next === prev ? prev : next;
            });
        };
        const schedule = () => {
            if (!frame) frame = requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, [boardRef, toolbarHeight]);

    return {
        toolbarRef,
        topInset,
        stickyHeaderTop,
        boardMaxHeight: `calc(100dvh - ${topInset + toolbarHeight + bottomInset}px)`,
    };
}
