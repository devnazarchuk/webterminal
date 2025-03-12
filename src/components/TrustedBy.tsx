export function TrustedBy() {
    const companies = [
        { name: "TechFlow", font: "font-normal" },
        { name: "Nexus Labs", font: "font-bold font-bricolage" },
        { name: "DataSync", font: "font-semibold font-merriweather" },
        { name: "VisionCorp", font: "font-normal font-instrument-serif" },
        { name: "CloudBase", font: "font-semibold font-playfair" },
        { name: "InnovateTech", font: "font-normal" },
        { name: "FlowState", font: "font-bold" },
    ];

    return (
        <section className="max-w-7xl sm:px-6 sm:mt-16 mt-12 mx-auto px-4">
            <div className="relative overflow-hidden sm:p-8 text-white text-center bg-neutral-950 border border-white/10 rounded-3xl p-6">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(255,255,255,0.06),transparent_60%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_80%_120%,rgba(255,255,255,0.05),transparent_60%)]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.12]"></div>
                </div>
                <div className="relative">
                    <h2 className="text-2xl sm:text-3xl tracking-tight">
                        Trusted by product teams
                    </h2>
                    <p className="text-white/70 mt-2">
                        From seed‑stage startups to enterprise platform groups.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4 mt-8 mb-8 items-center">
                        {companies.map((company, index) => (
                            <div
                                key={index}
                                className="flex gap-3 hover:text-white transition-colors duration-300 text-zinc-400 items-center justify-center"
                            >
                                <span className={`text-lg tracking-tighter ${company.font}`}>
                                    {company.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
