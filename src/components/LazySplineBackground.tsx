"use client";

import { useEffect, useRef, useState } from "react";

export function LazySplineBackground() {
    const [shouldLoad, setShouldLoad] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            // Don't load Spline for users who prefer reduced motion
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Load when element is about to enter viewport (with margin)
                    if (entry.isIntersecting) {
                        setShouldLoad(true);
                        // Disconnect after loading to prevent unnecessary re-renders
                        observer.disconnect();
                    }
                });
            },
            {
                // Start loading when element is 200px away from viewport
                rootMargin: "200px",
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden"
        >
            {shouldLoad && (
                <iframe
                    src="https://my.spline.design/spaceparticlesanimation-UGnU6SB7nUK6sFI6N5WzasEx"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    id="aura-spline"
                    title="Spline 3D Animation"
                    loading="lazy"
                />
            )}
        </div>
    );
}
