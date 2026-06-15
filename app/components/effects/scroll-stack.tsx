"use client";

import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import './scroll-stack.css';

// No mobile o Lenis roda um RAF loop infinito que causa jank — usar scroll nativo
const isMobileDevice = () =>
    typeof window !== 'undefined' && (window.innerWidth < 768 || 'ontouchstart' in window);

export interface ScrollStackItemProps {
    itemClassName?: string;
    children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
    <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
    className?: string;
    children: ReactNode;
    itemDistance?: number;
    itemScale?: number;
    itemStackDistance?: number;
    stackPosition?: string;
    scaleEndPosition?: string;
    baseScale?: number;
    scaleDuration?: number;
    rotationAmount?: number;
    blurAmount?: number;
    useWindowScroll?: boolean;
    onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
    children,
    className = '',
    itemDistance = 100,
    itemScale = 0.03,
    itemStackDistance = 30,
    stackPosition = '20%',
    scaleEndPosition = '10%',
    baseScale = 0.85,
    scaleDuration = 0.5,
    rotationAmount = 0,
    blurAmount = 0,
    useWindowScroll = false,
    onStackComplete
}) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const stackCompletedRef = useRef(false);
    const animationFrameRef = useRef<number | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lenisRef = useRef<any>(null);
    const cardsRef = useRef<HTMLElement[]>([]);
    const lastTransformsRef = useRef(new Map<number, any>());
    const isUpdatingRef = useRef(false);

    // Refs to cache untransformed positions to avoid layout shift feedback loop
    const initialOffsetsRef = useRef<number[]>([]);
    const endOffsetRef = useRef<number>(0);

    const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
        if (scrollTop < start) return 0;
        if (scrollTop > end) return 1;
        return (scrollTop - start) / (end - start);
    }, []);

    const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value as string);
    }, []);

    const getScrollData = useCallback(() => {
        if (useWindowScroll) {
            return {
                scrollTop: window.scrollY,
                containerHeight: window.innerHeight,
                scrollContainer: document.documentElement
            };
        } else {
            const scroller = scrollerRef.current;
            return {
                scrollTop: scroller ? scroller.scrollTop : 0,
                containerHeight: scroller ? scroller.clientHeight : 0,
                scrollContainer: scroller
            };
        }
    }, [useWindowScroll]);

    // Measure untransformed offsets once to prevent layout shifts on scroll
    const measurePositions = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller || !cardsRef.current.length) return;

        // Reset transforms temporarily to measure original layout offsets
        const cachedTransforms = cardsRef.current.map(card => {
            const t = card.style.transform;
            const f = card.style.filter;
            card.style.transform = '';
            card.style.filter = '';
            return { t, f };
        });

        // Measure cards
        initialOffsetsRef.current = cardsRef.current.map(card => {
            if (useWindowScroll) {
                const rect = card.getBoundingClientRect();
                return rect.top + window.scrollY;
            } else {
                return card.offsetTop;
            }
        });

        // Measure end element
        const endElement = scroller.querySelector('.scroll-stack-end') as HTMLElement;
        if (endElement) {
            if (useWindowScroll) {
                const rect = endElement.getBoundingClientRect();
                endOffsetRef.current = rect.top + window.scrollY;
            } else {
                endOffsetRef.current = endElement.offsetTop;
            }
        }

        // Restore transforms
        cardsRef.current.forEach((card, i) => {
            if (cachedTransforms[i]) {
                card.style.transform = cachedTransforms[i].t;
                card.style.filter = cachedTransforms[i].f;
            }
        });
    }, [useWindowScroll]);

    const updateCardTransforms = useCallback(() => {
        if (!cardsRef.current.length || isUpdatingRef.current) return;

        isUpdatingRef.current = true;

        const { scrollTop, containerHeight } = getScrollData();
        const stackPositionPx = parsePercentage(stackPosition, containerHeight);
        const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

        const cardOffsets = initialOffsetsRef.current;
        const endOffset = endOffsetRef.current;

        cardsRef.current.forEach((card, i) => {
            if (!card) return;

            const cardTop = cardOffsets[i] !== undefined ? cardOffsets[i] : 0;
            const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPositionPx;
            const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
            const pinEnd = endOffset - containerHeight / 2;

            const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
            const targetScale = baseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);
            const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

            let blur = 0;
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (blurAmount && !isMobile) {
                let topCardIndex = 0;
                for (let j = 0; j < cardsRef.current.length; j++) {
                    const jCardTop = cardOffsets[j] !== undefined ? cardOffsets[j] : 0;
                    const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
                    if (scrollTop >= jTriggerStart) {
                        topCardIndex = j;
                    }
                }

                if (i < topCardIndex) {
                    const depthInStack = topCardIndex - i;
                    blur = Math.max(0, depthInStack * blurAmount);
                }
            }

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

            if (isPinned) {
                translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
            }

            const newTransform = {
                translateY: translateY,
                scale: scale,
                rotation: rotation,
                blur: blur
            };

            const lastTransform = lastTransformsRef.current.get(i);
            const hasChanged =
                !lastTransform ||
                Math.abs(lastTransform.translateY - newTransform.translateY) > 0.05 ||
                Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
                Math.abs(lastTransform.rotation - newTransform.rotation) > 0.05 ||
                Math.abs(lastTransform.blur - newTransform.blur) > 0.05;

            if (hasChanged) {
                // Fixed precision string to avoid layout thrashing
                const transform = `translate3d(0, ${newTransform.translateY.toFixed(2)}px, 0) scale(${newTransform.scale.toFixed(4)}) rotate(${newTransform.rotation.toFixed(2)}deg)`;
                const filter = newTransform.blur > 0 ? `blur(${newTransform.blur.toFixed(2)}px)` : '';

                card.style.transform = transform;
                card.style.filter = filter;

                lastTransformsRef.current.set(i, newTransform);
            }

            if (i === cardsRef.current.length - 1) {
                const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
                if (isInView && !stackCompletedRef.current) {
                    stackCompletedRef.current = true;
                    onStackComplete?.();
                } else if (!isInView && stackCompletedRef.current) {
                    stackCompletedRef.current = false;
                }
            }
        });

        isUpdatingRef.current = false;
    }, [
        itemScale,
        itemStackDistance,
        stackPosition,
        scaleEndPosition,
        baseScale,
        rotationAmount,
        blurAmount,
        onStackComplete,
        calculateProgress,
        parsePercentage,
        getScrollData
    ]);

    const handleScroll = useCallback(() => {
        updateCardTransforms();
    }, [updateCardTransforms]);

    const setupLenis = useCallback((onReady?: () => void) => {
        // No mobile: usa scroll nativo (evita RAF loop infinito do Lenis)
        if (isMobileDevice()) { onReady?.(); return; }

        // Import dinâmico — Lenis sai do bundle inicial (só carregado em desktop)
        import('lenis').then(({ default: Lenis }) => {
            if (!scrollerRef.current && !useWindowScroll) { onReady?.(); return; }

            const opts = useWindowScroll
                ? {
                    duration: 1.2,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    touchMultiplier: 2,
                    infinite: false,
                    wheelMultiplier: 1,
                    lerp: 0.1,
                    syncTouch: true,
                    syncTouchLerp: 0.075,
                }
                : {
                    wrapper: scrollerRef.current!,
                    content: scrollerRef.current!.querySelector('.scroll-stack-inner') as HTMLElement,
                    duration: 1.2,
                    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                    smoothWheel: true,
                    touchMultiplier: 2,
                    infinite: false,
                    gestureOrientation: 'vertical' as const,
                    wheelMultiplier: 1,
                    lerp: 0.1,
                    syncTouch: true,
                    syncTouchLerp: 0.075,
                };

            const lenis = new Lenis(opts);
            lenis.on('scroll', handleScroll);

            const raf = (time: number) => {
                lenis.raf(time);
                animationFrameRef.current = requestAnimationFrame(raf);
            };
            animationFrameRef.current = requestAnimationFrame(raf);
            lenisRef.current = lenis;
            onReady?.();
        });
    }, [handleScroll, useWindowScroll]);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (!scroller) return;

        const cards = Array.from(
            scroller.querySelectorAll('.scroll-stack-card')
        ) as HTMLElement[];

        cardsRef.current = cards;
        const transformsCache = lastTransformsRef.current;

        cards.forEach((card, i) => {
            if (i < cards.length - 1) {
                card.style.marginBottom = `${itemDistance}px`;
            }
            if (!isMobileDevice()) {
                card.style.willChange = 'transform, filter';
            } else {
                card.style.willChange = 'transform';
            }
            card.style.transformOrigin = 'top center';
            card.style.backfaceVisibility = 'hidden';
            card.style.transform = 'translateZ(0)';
            card.style.webkitTransform = 'translateZ(0)';
            card.style.perspective = '1000px';
            card.style.webkitPerspective = '1000px';
        });

        // First measure initial offsets
        measurePositions();

        // setupLenis agora é async (import dinâmico); usamos flag para evitar uso pós-unmount
        let unmounted = false;

        setupLenis(() => {
            // callback chamado após Lenis estar pronto (ou imediatamente em mobile)
            if (unmounted) return;
            updateCardTransforms();
        });

        // Debounce do resize: measurePositions remove transforms temporariamente (causa flash) —
        // com debounce só executa quando o resize para, não durante
        let resizeTimer: ReturnType<typeof setTimeout>;
        const onNativeResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                measurePositions();
                updateCardTransforms();
            }, 150);
        };

        const usesNativeScroll = isMobileDevice() || !useWindowScroll;
        window.addEventListener('resize', onNativeResize, { passive: true });
        if (useWindowScroll && usesNativeScroll) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        updateCardTransforms();

        return () => {
            unmounted = true;
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', onNativeResize);
            if (useWindowScroll && usesNativeScroll) {
                window.removeEventListener('scroll', handleScroll);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (lenisRef.current) {
                lenisRef.current.destroy();
                lenisRef.current = null;
            }
            stackCompletedRef.current = false;
            cardsRef.current = [];
            transformsCache.clear();
            isUpdatingRef.current = false;
        };
    }, [
        itemDistance,
        itemScale,
        itemStackDistance,
        stackPosition,
        scaleEndPosition,
        baseScale,
        scaleDuration,
        rotationAmount,
        blurAmount,
        useWindowScroll,
        onStackComplete,
        setupLenis,
        updateCardTransforms,
        measurePositions,
        handleScroll
    ]);

    return (
        <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
            <div className="scroll-stack-inner">
                {children}
                {/* Spacer so the last pin can release cleanly */}
                <div className="scroll-stack-end" />
            </div>
        </div>
    );
};

export default ScrollStack;
