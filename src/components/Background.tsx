export function Background() {
    return (
        <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none">
            {/* Radial Gradient 1 */}
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(255,255,255,0.06),transparent_60%)]"></div>

            {/* Radial Gradient 2 */}
            <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_120%,rgba(255,255,255,0.05),transparent_60%)]"></div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.12]"></div>

            {/* Moving Grain Overlay */}
            <div className="absolute inset-0 opacity-[0.035]">
                <div
                    className="absolute -inset-[100%] w-[300%] h-[300%] bg-repeat animate-[noise_8s_steps(10)_infinite]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
                    }}
                ></div>
            </div>
        </div>
    );
}
