import { Maximize2, Minus, Plus } from 'lucide-react';
import PillButton from './pill-button';

interface ZoomClusterProps {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onFit: () => void;
}

/**
 * On-screen zoom controls. Everything here is also a gesture (pinch, ctrl+wheel,
 * double-tap) or a key — these exist for people who don't guess gestures.
 */
export default function ZoomCluster({ zoom, onZoomIn, onZoomOut, onFit }: ZoomClusterProps) {
    return (
        <div className="flex items-center gap-1 shrink-0" title="Pinch, ctrl+scroll or double-tap to zoom">
            <PillButton onClick={onZoomOut} aria-label="Zoom out" size="sm">
                <Minus size={12} />
            </PillButton>
            <span className="w-9 text-center text-[9px] font-black tabular-nums text-muted-foreground">
                {Math.round(zoom * 100)}%
            </span>
            <PillButton onClick={onZoomIn} aria-label="Zoom in" size="sm">
                <Plus size={12} />
            </PillButton>
            <PillButton onClick={onFit} aria-label="Fit whole day on screen" size="sm">
                <Maximize2 size={11} />
                FIT
            </PillButton>
        </div>
    );
}
