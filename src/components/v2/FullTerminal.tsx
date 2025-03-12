'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useConfig } from '../ConfigProvider';
import { CustomizationCommands } from '@/lib/customizationCommands';
import { VirtualFileSystem } from '@/lib/virtualFileSystem';
import { LinuxCommands } from '@/lib/linuxCommands';
import { FunCommands } from '@/lib/funCommands';
import { getGitHubStats } from '@/lib/stats';

interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system' | 'warning';
    tight?: boolean;
}

interface FileSystemItem {
    name: string;
    type: 'file' | 'dir';
}

const MAX_LINES = 25;
const ALL_COMMANDS = [
    'help', 'clear', 'whoami', 'neofetch',
    'goto', 'stats', 'logs', 'matrix', 'pipes', 'theme',
    // Customization commands
    'color', 'ui', 'font', 'text', 'config',
    // Linux file commands
    'ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'echo',
    // Linux system commands
    'uname', 'uptime', 'free', 'df', 'ps', 'top', 'htop', 'history', 'man', 'grep', 'find', 'wc',
    'sudo', 'dmesg', 'apropos', 'iusearchbtw', 'pacman',
    // Fun
    'cmatrix', 'cowsay', 'fortune', 'sl', 'figlet', 'ping', 'curl', 'wget', 'env', 'which'
];

// Global VFS instance (persists across renders)
const vfs = new VirtualFileSystem();
vfs.resetToHome();

const TerminalRow = React.memo(({ line, destructionProgress }: { line: TerminalLine, destructionProgress: number }) => {
    return (
        <div className={`
            select-text
            ${line.tight ? 'leading-[0.8] !mt-0' : ''}
            ${line.type === 'input' ? 'text-zinc-600' : ''}
            ${line.type === 'output' ? 'text-zinc-300' : ''}
            ${line.type === 'error' ? 'text-red-500' : ''}
            ${line.type === 'success' ? 'text-[var(--accent)]' : ''}
            ${line.type === 'system' ? 'text-blue-400 font-bold' : ''}
            ${line.type === 'warning' ? 'text-yellow-400' : ''}
            ${destructionProgress > 30 && Math.random() > 0.7 ? 'translate-x-10 opacity-0' : ''}
        `}>
            {line.text}
        </div>
    );
});

TerminalRow.displayName = 'TerminalRow';

export const FullTerminal: React.FC = () => {
    const router = useRouter();
    const { config, updateConfig, exportConfig, importConfig, saveNamed, loadNamed, getSavedNames, deleteNamed, resetConfig, loadPreset } = useConfig();

    const [lines, setLines] = useState<TerminalLine[]>([
        { text: "SYSTEM_INITIALIZED_SESSION", type: 'success' },
        { text: "Accessing high-level site control node...", type: 'system' },
        { text: "Type 'help' for full command list.", type: 'output' },
    ]);
    const [input, setInput] = useState("");
    const [cursorPos, setCursorPos] = useState(0);
    const [isFocused, setIsFocused] = useState(true);
    const [suggestion, setSuggestion] = useState("");
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isRoot, setIsRoot] = useState(false);
    const [isMatrixActive, setIsMatrixActive] = useState(config.ui.showMatrixEffect);
    const [isPipesActive, setIsPipesActive] = useState(config.ui.showPipesEffect);
    const [isDestroyed, setIsDestroyed] = useState(false);
    const [isArchDestroyed, setIsArchDestroyed] = useState(false);
    const [destructionProgress, setDestructionProgress] = useState(0);
    const [activeLiveMode, setActiveLiveMode] = useState<'htop' | 'top' | 'sl' | null>(null);
    const [liveLines, setLiveLines] = useState<TerminalLine[]>([]);

    // Sync matrix state with config
    useEffect(() => {
        setIsMatrixActive(config.ui.showMatrixEffect);
        setIsPipesActive(config.ui.showPipesEffect);
    }, [config.ui.showMatrixEffect, config.ui.showPipesEffect]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pipesRef = useRef<HTMLCanvasElement>(null);

    // Suggestion Logic (Commands + Files)
    useEffect(() => {
        if (!input) {
            setSuggestion("");
            return;
        }

        // 1. Check for Command Autocomplete (start of line)
        const lowerInput = input.toLowerCase();
        if (!input.includes(' ')) {
            const cmdMatch = ALL_COMMANDS.find(c =>
                c.startsWith(lowerInput) && c.length > input.length
            );
            if (cmdMatch) {
                setSuggestion(cmdMatch);
                return;
            }
        }

        // 2. Check for File Autocomplete (last argument)
        const lastSpace = input.lastIndexOf(' ');
        if (lastSpace !== -1) {
            const prefix = input.slice(0, lastSpace + 1);
            const currentArg = input.slice(lastSpace + 1);

            if (currentArg) {
                // Get current directory files from VFS
                // We need to access vfs.ls() but vfs is proper-cased.
                // vfs.ls([]) return { output: string[] }
                // Warning: vfs.ls output depends on flags. 
                // Let's manually access vfs children logic or assume a helper.
                // Or just use vfs.ls() which returns formatted strings? 
                // Wait, vfs.ls returns strings like "file.txt" or "dir/" in short mode.
                // WE NEED RAW FILENAMES.

                // Let's cheat and try to access children of current node if possible OR
                // parse `vfs.ls([])` output.
                // LinuxCommands.handleLs(vfs, []) returns TerminalLine[] which contains text.
                // Actually `vfs.ls()` method returns { success, output } where output is list of names in standard mode.

                const res = vfs.ls([]);
                // output of ls([]) is single string "file1 file2" joined by spaces? 
                // Looking at virtualFileSystem.ts:
                // output.push(names.join('  ')); -> It joins them!

                // We need a raw list of files for autocomplete.
                // Let's add a helper to VFS or just parse the ls output carefully?
                // Parsing "file1  file2" is easy.

                if (res.success && res.output.length > 0) {
                    const fileNames = res.output[0].split('  ').map(f => f.trim()).filter(f => f);

                    const match = fileNames.find(f =>
                        f.toLowerCase().startsWith(currentArg.toLowerCase()) && f.length > currentArg.length
                    );

                    if (match) {
                        setSuggestion(prefix + match);
                        return;
                    }
                }
            }
        }

        setSuggestion("");
    }, [input, vfs]);

    // Global keyboard listener for Ctrl+C (works even during live modes)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'c' && e.ctrlKey && activeLiveMode) {
                const mode = activeLiveMode;
                setActiveLiveMode(null);
                setLines(prev => [...prev, { text: `^C`, type: 'input' }, { text: `${mode} stopped`, type: 'system' }]);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [activeLiveMode]);

    // Reliable terminal scrolling - only scroll when content changes
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current;
            const scroll = () => {
                container.scrollTop = container.scrollHeight;
            };

            // Immediate scroll
            scroll();

            // Slower fallback for dynamic content (images, fonts)
            const timeout = setTimeout(scroll, 50);
            const raf = requestAnimationFrame(scroll);

            return () => {
                clearTimeout(timeout);
                cancelAnimationFrame(raf);
            };
        }
    }, [lines, liveLines, input]);

    // Force body to be overflow-hidden when terminal is active
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Expose function to input commands from external sources
    useEffect(() => {
        (window as any).inputTerminalCommand = (cmd: string) => {
            setInput(cmd);
            setCursorPos(cmd.length);
            inputRef.current?.focus();
        };

        // Permanent focus logic
        const focusInput = () => {
            const selection = window.getSelection();
            const isSelecting = selection && selection.toString().length > 0;

            if (isFocused && !activeLiveMode && !isDestroyed && !isSelecting) {
                inputRef.current?.focus();
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            // Focus if clicking anywhere in the terminal container
            focusInput();
        };

        window.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('focus', focusInput);
        const interval = setInterval(focusInput, 100); // Periodic check to ensure focus

        return () => {
            delete (window as any).inputTerminalCommand;
            window.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('focus', focusInput);
            clearInterval(interval);
        };
    }, [isFocused, activeLiveMode, isDestroyed]);


    // Matrix Effect
    useEffect(() => {
        if (!isMatrixActive || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%"\'#&_(),.;:?!\\|{}<>[]';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops: number[] = [];

        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = (config.ui as any).matrixColor || config.colors.accent;
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 33);
        const handleResize = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [isMatrixActive]);

    // Pipes Effect
    useEffect(() => {
        if (!isPipesActive || !pipesRef.current) return;

        const canvas = pipesRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pipeCount = 8;
        const cellSize = 20;
        const gridW = Math.ceil(canvas.width / cellSize);
        const gridH = Math.ceil(canvas.height / cellSize);

        type Pipe = {
            x: number;
            y: number;
            dir: number; // 0: Right, 1: Down, 2: Left, 3: Up
            color: string;
        };

        const colors = [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00',
            '#ff00ff', '#00ffff', '#ffffff', '#ff8800'
        ];

        let pipes: Pipe[] = [];

        const initPipes = () => {
            pipes = Array.from({ length: pipeCount }, () => ({
                x: Math.floor(Math.random() * gridW),
                y: Math.floor(Math.random() * gridH),
                dir: Math.floor(Math.random() * 4),
                color: colors[Math.floor(Math.random() * colors.length)]
            }));
        };

        initPipes();
        ctx.lineCap = 'round';
        ctx.lineWidth = cellSize / 2;

        const draw = () => {
            // Very faint fade or just keep drawing? Pipes usually fill up.
            // Let's fade a tiny bit to avoid full saturation
            ctx.fillStyle = 'rgba(0, 0, 0, 0.005)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            pipes.forEach(pipe => {
                ctx.strokeStyle = pipe.color;
                ctx.beginPath();
                ctx.moveTo(pipe.x * cellSize + cellSize / 2, pipe.y * cellSize + cellSize / 2);

                // Change direction occasionally
                if (Math.random() < 0.1) {
                    const turn = Math.random() < 0.5 ? 1 : -1;
                    pipe.dir = (pipe.dir + turn + 4) % 4;
                }

                if (pipe.dir === 0) pipe.x++;
                else if (pipe.dir === 1) pipe.y++;
                else if (pipe.dir === 2) pipe.x--;
                else if (pipe.dir === 3) pipe.y--;

                ctx.lineTo(pipe.x * cellSize + cellSize / 2, pipe.y * cellSize + cellSize / 2);
                ctx.stroke();

                // Reset pipe if out of bounds
                if (pipe.x < 0 || pipe.x >= gridW || pipe.y < 0 || pipe.y >= gridH) {
                    pipe.x = Math.floor(Math.random() * gridW);
                    pipe.y = Math.floor(Math.random() * gridH);
                    pipe.dir = Math.floor(Math.random() * 4);
                    pipe.color = colors[Math.floor(Math.random() * colors.length)];
                }
            });
        };

        const interval = setInterval(draw, 50);
        const handleResize = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                // Note: Clearing canvas resets pipes, but we only do it if size actually changed
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        };
    }, [isPipesActive]);

    // Live Command Update Interval
    useEffect(() => {
        if (!activeLiveMode) {
            setLiveLines([]);
            return;
        }

        let frame = 0;

        const updateLive = () => {
            if (activeLiveMode === 'htop') {
                setLiveLines(LinuxCommands.handleHtop());
            } else if (activeLiveMode === 'top') {
                setLiveLines(LinuxCommands.handleTop());
            } else if (activeLiveMode === 'sl') {
                const trainLines = FunCommands.handleSl();
                // Traverse entire screen from right to left
                const x = 180 - frame * 5;
                const padding = " ".repeat(Math.max(0, x));
                const sliceIdx = Math.abs(Math.min(0, x));

                setLiveLines(trainLines.map(l => ({
                    ...l,
                    text: padding + l.text.slice(sliceIdx),
                    tight: true
                })));

                frame++;
                if (x < -150) { // Go fully off-screen
                    setActiveLiveMode(null);
                }
            }
        };

        const intervalTime = activeLiveMode === 'sl' ? 40 : 1000;
        updateLive();
        const interval = setInterval(updateLive, intervalTime);
        return () => clearInterval(interval);
    }, [activeLiveMode, config]);

    const processCommand = async (cmdInput: string) => {
        const cmdText = cmdInput.trim();
        if (!cmdText) return;

        const parts = cmdText.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        const promptStart = isRoot ? `root@${config.text.systemName || 'site-control'}:~# ` : `${config.text.username || 'admin'}@${config.text.systemName || 'site-control'}:~$ `;
        setLines(prev => [...prev, { text: `${promptStart}${cmdText}`, type: 'input' }]);

        const outputLines: TerminalLine[] = [];

        switch (cmd) {
            case 'help':
                outputLines.push({ text: "=== SYSTEM CONTROL INTERFACE ===", type: 'success' });
                outputLines.push({ text: "CUSTOMIZATION:", type: 'system' });
                outputLines.push({ text: "  color, ui, font, text, theme, config", type: 'output' });
                outputLines.push({ text: "FILE_SYSTEM:", type: 'system' });
                outputLines.push({ text: "  ls, cd, pwd, mkdir, touch, rm, cat, echo, grep, find, wc, sort", type: 'output' });
                outputLines.push({ text: "SYSTEM_INFO:", type: 'system' });
                outputLines.push({ text: "  uname, uptime, free, df, ps, top, htop, dmesg, env, which, history", type: 'output' });
                outputLines.push({ text: "NETWORK:", type: 'system' });
                outputLines.push({ text: "  ping, curl, wget", type: 'output' });
                outputLines.push({ text: "SYSTEM_TOOLS:", type: 'system' });
                outputLines.push({ text: "  stats, logs, neofetch, whoami, clear, matrix, pipes, goto, sudo, apropos", type: 'output' });
                outputLines.push({ text: "FUN:", type: 'system' });
                outputLines.push({ text: "  cmatrix, cowsay, fortune, sl, figlet, iusearchbtw", type: 'output' });
                outputLines.push({ text: "Type 'man <command>' for detailed documentation.", type: 'output' });
                break;
            case 'goto':
                if (args.length === 0) {
                    outputLines.push({ text: "Usage: goto [home|about|projects|resume|services]", type: 'error' });
                } else {
                    const target = args[0].toLowerCase();
                    const routes: { [key: string]: string } = {
                        home: '/',
                        about: '/#about',
                        projects: '/#projects',
                        resume: '/resume',
                        services: '/#services' // assuming services is an anchor or route
                    };
                    if (routes[target]) {
                        outputLines.push({ text: `Redirecting to ${target}...`, type: 'success' });
                        setTimeout(() => router.push(routes[target]), 1000);
                    } else {
                        outputLines.push({ text: `Target node not found: ${target}`, type: 'error' });
                    }
                }
                break;
            case 'stats':
                setLines(prev => [...prev, { text: "FETCHING SYSTEM METRICS...", type: 'system' as const }]);

                // Simulate network latency/processing
                const [gitStats] = await Promise.all([
                    getGitHubStats('devnazarchuk'),
                    new Promise(r => setTimeout(r, 800))
                ]);

                const stats: TerminalLine[] = [
                    { text: "--- CENTRAL PROCESSOR STATUS ---", type: 'system' },
                    { text: `UPTIME: ${Math.floor(Math.random() * 10000)}s`, type: 'output' },
                    { text: `CPU_LOAD: ${(Math.random() * 5 + 1).toFixed(2)}%`, type: 'output' },
                    { text: `MEM_HEAP_USED: ${(Math.random() * 50 + 20).toFixed(1)}MB`, type: 'output' },
                    { text: `GITHUB_REPOS: ${gitStats.repos}`, type: 'output' },
                    { text: `GITHUB_COMMITS: ~${gitStats.commits}`, type: 'output' },
                    { text: `ACTIVE_NODES: 12`, type: 'output' },
                    { text: "STATUS: OPTIMIZED", type: 'success' }
                ];
                setLines(prev => [...prev, ...stats].slice(-MAX_LINES));
                return;
            case 'logs':
                outputLines.push({ text: "FETCHING SYSTEM JOURNALS...", type: 'system' });
                const mockLogs = [
                    "08:42:11 [INFO] Handshake initialized with remote node.",
                    "08:42:15 [SUCCESS] Connection established (TLS 1.3).",
                    "08:42:20 [DEBUG] Parsing localized metadata (UTF-8).",
                    "08:42:25 [INFO] Prefetching static assets for concurrent view.",
                    "08:42:30 [SUCCESS] Environment stabilized."
                ];
                mockLogs.forEach(l => outputLines.push({ text: l, type: 'output' }));
                break;
            case 'matrix':
                const colorArg = args[0];
                if (colorArg) {
                    updateConfig({ ui: { ...config.ui, showMatrixEffect: true, matrixColor: colorArg } as any });
                } else {
                    updateConfig({ ui: { ...config.ui, showMatrixEffect: !isMatrixActive, matrixColor: undefined } as any });
                }
                setIsMatrixActive(!isMatrixActive || !!colorArg);
                break;
            case 'pipes':
                const newPipesState = !isPipesActive;
                setIsPipesActive(newPipesState);
                updateConfig({ ui: { ...config.ui, showPipesEffect: newPipesState } });
                outputLines.push({ text: newPipesState ? "✓ Pipes enabled" : "✓ Pipes disabled", type: 'success' });
                break;
            case 'theme':
                outputLines.push(...CustomizationCommands.handleThemeCommand(args, loadPreset));
                break;
            case 'color':
                outputLines.push(...CustomizationCommands.handleColorCommand(args, config, updateConfig));
                break;
            case 'ui':
                outputLines.push(...CustomizationCommands.handleUICommand(args, config, updateConfig));
                break;
            case 'font':
                outputLines.push(...CustomizationCommands.handleFontCommand(args, config, updateConfig));
                break;
            case 'text':
                outputLines.push(...CustomizationCommands.handleTextCommand(args, config, updateConfig));
                break;
            case 'config':
                outputLines.push(...CustomizationCommands.handleConfigCommand(
                    args, config, exportConfig, importConfig,
                    saveNamed, loadNamed, getSavedNames, deleteNamed, resetConfig
                ));
                break;
            case 'clear':
                setLines([]);
                return;
            case 'exit':
                if (isRoot) {
                    setIsRoot(false);
                    outputLines.push({ text: "Logged out from root. Back to mortal admin.", type: 'system' });
                    break;
                }
                outputLines.push({ text: "Use the UI buttons to navigate or just close the tab.", type: 'system' });
                break;
            case 'whoami':
                outputLines.push({ text: `User: ${config.text.username}`, type: 'output' });
                outputLines.push({ text: `System: ${config.text.systemName}`, type: 'output' });
                outputLines.push({ text: "Permissions: Full Control", type: 'output' });
                break;
            // Inherit some basic ones from main terminal
            case 'neofetch':
                setLines(prev => [...prev, { text: "GATHERING SYSTEM INFO...", type: 'system' as const }]);

                await new Promise(r => setTimeout(r, 600));
                setLines(prev => [...prev, ...LinuxCommands.handleNeofetch(config)].slice(-MAX_LINES));
                return;

            // Linux File System Commands
            case 'ls':
                outputLines.push(...LinuxCommands.handleLs(vfs, args));
                break;
            case 'cd':
                outputLines.push(...LinuxCommands.handleCd(vfs, args));
                break;
            case 'pwd':
                outputLines.push(...LinuxCommands.handlePwd(vfs));
                break;
            case 'mkdir':
                outputLines.push(...LinuxCommands.handleMkdir(vfs, args));
                break;
            case 'touch':
                outputLines.push(...LinuxCommands.handleTouch(vfs, args));
                break;
            case 'rm':
                outputLines.push(...LinuxCommands.handleRm(vfs, args));
                break;
            case 'cat':
                outputLines.push(...LinuxCommands.handleCat(vfs, args));
                break;
            case 'echo':
                outputLines.push(...LinuxCommands.handleEcho(vfs, args));
                break;

            // Linux System Commands
            case 'uname':
                outputLines.push(...LinuxCommands.handleUname(args));
                break;
            case 'uptime':
                outputLines.push(...LinuxCommands.handleUptime());
                break;
            case 'free':
                outputLines.push(...LinuxCommands.handleFree());
                break;
            case 'df':
                outputLines.push(...LinuxCommands.handleDf());
                break;
            case 'ps':
                outputLines.push(...LinuxCommands.handlePs());
                break;
            case 'top':
                setActiveLiveMode('top');
                return;
            case 'htop':
                setActiveLiveMode('htop');
                return;
            case 'dmesg':
                outputLines.push(...LinuxCommands.handleDmesg());
                break;
            case 'apropos':
                outputLines.push(...LinuxCommands.handleApropos(args));
                break;
            case 'iusearchbtw':
                const archRes = LinuxCommands.handleIUseArchBTW();
                outputLines.push(...archRes.lines);
                setTimeout(() => setIsArchDestroyed(true), 2000);
                break;
            case 'sudo':
                if (args[0] === 'su') {
                    setIsRoot(true);
                    const username = config.text.username || 'admin';
                    outputLines.push(
                        { text: `[sudo] password for ${username}: `, type: 'system' },
                        { text: "Password accepted.", type: 'success' },
                        { text: "Welcome, Almighty One. Use your power wisely.", type: 'system' },
                        { text: "You are now logged in as root.", type: 'system' }
                    );
                    break;
                }
                const sudoRes = LinuxCommands.handleSudo(args, config);
                outputLines.push(...sudoRes.lines);
                if (sudoRes.startDestruction) {
                    // Start the destruction sequence
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += 1; // Slower, more agonizing destruction
                        setDestructionProgress(progress);

                        // Chaotic glitching
                        if (progress % 10 === 0) {
                            setLines(prev => [...prev, { text: `[CRITICAL] Data corruption at 0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`, type: 'error' as const }].slice(-MAX_LINES));
                        }

                        if (progress >= 100) {
                            clearInterval(interval);
                            setTimeout(() => setIsDestroyed(true), 800);
                        }
                    }, 50);
                }
                break;

            // Linux Utility Commands
            case 'history':
                outputLines.push(...LinuxCommands.handleHistory(history));
                break;
            case 'man':
                outputLines.push(...LinuxCommands.handleMan(args));
                break;
            case 'grep':
                outputLines.push(...LinuxCommands.handleGrep(args, vfs));
                break;
            case 'find':
                outputLines.push(...LinuxCommands.handleFind(vfs, args));
                break;
            case 'wc':
                outputLines.push(...LinuxCommands.handleWc(args, vfs));
                break;
            case 'sort':
                outputLines.push(...LinuxCommands.handleSort(args, vfs));
                break;
            case 'ping':
                if (args.length === 0) {
                    outputLines.push({ text: "ping: missing host operand", type: 'error' });
                } else {
                    const host = args[0];
                    outputLines.push({ text: `PING ${host} (127.0.0.1) 56(84) bytes of data.`, type: 'output' });
                    setLines(prev => [...prev, ...outputLines]);
                    outputLines.length = 0; // Clear for next set

                    for (let i = 0; i < 4; i++) {
                        await new Promise(r => setTimeout(r, 600));
                        const time = (Math.random() * 20 + 10).toFixed(3);
                        setLines(prev => [...prev, { text: `64 bytes from ${host} (127.0.0.1): icmp_seq=${i + 1} ttl=64 time=${time} ms`, type: 'output' as const }]);
                    }

                    await new Promise(r => setTimeout(r, 200));
                    outputLines.push({ text: `--- ${host} ping statistics ---`, type: 'output' });
                    outputLines.push({ text: "4 packets transmitted, 4 received, 0% packet loss, time 3004ms", type: 'output' });
                }
                break;
            case 'curl':
                if (args.length === 0) {
                    outputLines.push({ text: "curl: try 'curl --help' for more information", type: 'error' });
                } else {
                    outputLines.push({ text: `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`, type: 'output', tight: true });
                    outputLines.push({ text: "                                 Dload  Upload   Total   Spent    Left  Speed", type: 'output', tight: true });
                    setLines(prev => [...prev, ...outputLines]);
                    outputLines.length = 0;

                    await new Promise(r => setTimeout(r, 1000));
                    outputLines.push(...LinuxCommands.handleCurl(args));
                }
                break;
            case 'wget':
                if (args.length === 0) {
                    outputLines.push({ text: "wget: missing URL", type: 'error' });
                } else {
                    outputLines.push({ text: `Resolving ${args[0]}... connected.`, type: 'output' });
                    setLines(prev => [...prev, ...outputLines]);
                    outputLines.length = 0;

                    await new Promise(r => setTimeout(r, 1200));
                    outputLines.push(...LinuxCommands.handleWget(args, vfs));
                }
                break;
            case 'which':
                outputLines.push(...LinuxCommands.handleWhich(args));
                break;
            case 'env':
                outputLines.push(...LinuxCommands.handleEnv());
                break;
            case 'whoami':
                outputLines.push(...LinuxCommands.handleWhoami(config));
                break;

            // Fun Commands
            case 'cmatrix':
                // Alias for matrix
                const matrixState = !isMatrixActive;
                setIsMatrixActive(matrixState);
                updateConfig({ ui: { ...config.ui, showMatrixEffect: matrixState } });
                outputLines.push({ text: matrixState ? "✓ Matrix enabled" : "✓ Matrix disabled", type: 'success' });
                break;
            case 'cowsay':
                outputLines.push(...FunCommands.handleCowsay(args));
                break;
            case 'fortune':
                outputLines.push(...FunCommands.handleFortune());
                break;
            case 'sl':
                setActiveLiveMode('sl');
                return;
            case 'figlet':
                outputLines.push(...FunCommands.handleFiglet(args));
                break;
            case 'pacman':
                if (args.length === 0) {
                    outputLines.push({ text: "pacman: error: you forgot the flag, as usual.", type: 'error' });
                    break;
                }

                const flagStr = args.join(' ');
                if (isArchDestroyed && flagStr === '-Syu --fix-everything') {
                    outputLines.push({ text: ":: Synchronizing package databases...", type: 'system' });
                    outputLines.push({ text: ":: Starting full system upgrade...", type: 'system' });
                    outputLines.push({ text: ":: Resolving elitism dependencies...", type: 'system' });
                    outputLines.push({ text: ":: Patching brain/kernel with KISS principal...", type: 'success' });
                    outputLines.push({ text: ":: System recovered. Elitism level stabilized at CHAD.", type: 'success' });
                    setTimeout(() => setIsArchDestroyed(false), 2000);
                } else {
                    outputLines.push({ text: `Xp-px, you really thought there was a pacman here with flags like "${flagStr}"?`, type: 'system' });
                    outputLines.push({ text: "Here is your pacman:", type: 'system' });
                    outputLines.push({ text: "", type: 'output' });
                    outputLines.push(
                        { text: "  ──▒▒▒▒▒────▄████▄─────", type: 'warning', tight: true },
                        { text: "  ─▒─▄▒─▄▒──███▄█▀──────", type: 'warning', tight: true },
                        { text: "  ─▒▒▒▒▒▒▒─▐████──█──█──", type: 'warning', tight: true },
                        { text: "  ─▒▒▒▒▒▒▒──█████▄──────", type: 'warning', tight: true },
                        { text: "  ─▒─▒─▒─▒───▀████▀─────", type: 'warning', tight: true },
                        { text: "", type: 'output' },
                        { text: "               -> The Real Pacman <-", type: 'system' }
                    );
                }
                break;

            default:
                outputLines.push({ text: `Unknown command: ${cmd}`, type: 'error' });
        }

        if (outputLines.length > 0) {
            setLines(prev => {
                const newLines = [...prev, ...outputLines];
                return newLines.slice(-MAX_LINES); // Keep only last 400 lines for performance
            });
        }
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const val = input.trim();
        if (val) {
            setInput("");
            setCursorPos(0);
            setSuggestion("");
            setHistoryIndex(-1);
            setHistory(prev => [val, ...prev.filter(h => h !== val)].slice(0, 50));
            await processCommand(val);
            setLines(prev => prev.slice(-MAX_LINES));
        } else {
            const promptStart = isRoot ? config.terminal.promptRoot + ' ' : config.terminal.prompt + ' ';
            setLines(prev => [...prev, { text: promptStart, type: 'input' as const }].slice(-MAX_LINES));
            setInput("");
            setCursorPos(0);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const target = e.currentTarget;

        // Ctrl+C - Break process
        if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
            e.preventDefault();
            if (isMatrixActive) {
                setIsMatrixActive(false);
                updateConfig({ ui: { ...config.ui, showMatrixEffect: false } });
                setLines(prev => [...prev, { text: "^C", type: 'input' }, { text: "Matrix stopped", type: 'system' }] as TerminalLine[]);
            } else if (isPipesActive) {
                setIsPipesActive(false);
                updateConfig({ ui: { ...config.ui, showPipesEffect: false } });
                setLines(prev => [...prev, { text: "^C", type: 'input' }, { text: "Pipes stopped", type: 'system' }] as TerminalLine[]);
            } else if (activeLiveMode) {
                const mode = activeLiveMode;
                setActiveLiveMode(null);
                setLines(prev => [...prev, { text: `^C`, type: 'input' }, { text: `${mode} stopped`, type: 'system' }]);
            } else {
                const user = isRoot ? 'root' : (config.text.username || 'admin');
                const host = config.text.systemName || 'site-control';
                const symbol = isRoot ? '#' : '$';
                const prompt = `${user}@${host}:~${symbol} `;

                setLines(prev => [...prev, { text: `${prompt}${input}^C`, type: 'input' }]);
                setInput("");
                setCursorPos(0);
                setSuggestion("");
            }
            return;
        }

        // Always prevent default Tab behavior to keep focus
        if (e.key === 'Tab') {
            e.preventDefault();
        }

        // Tab or Right Arrow - Accept suggestion
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion) {
            // If it's a file suggestion (appended to input), we need to handle it differently
            // But currently suggestion logic replaces the whole input or appends? 
            // Let's assume suggestion is the FULL accepted string or the finishing part.
            // My current logic sets input = suggestion. 
            // So suggestion must be the FULL command line.

            setInput(suggestion);
            setCursorPos(suggestion.length);
            setSuggestion("");
            return;
        }

        // Up/Down Arrow - History
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
                if (historyIndex === -1) {
                    setHistoryIndex(0);
                    setInput(history[0]);
                    setCursorPos(history[0].length);
                } else if (newIndex !== historyIndex) {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                    setCursorPos(history[newIndex].length);
                }
                setSuggestion("");
            }
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex !== -1) {
                const newIndex = historyIndex - 1;
                if (newIndex === -1) {
                    setHistoryIndex(-1);
                    setInput("");
                    setCursorPos(0);
                } else {
                    setHistoryIndex(newIndex);
                    setInput(history[newIndex]);
                    setCursorPos(history[newIndex].length);
                }
                setSuggestion("");
            }
            return;
        }

        // Ctrl+Left/Right - Word Jump
        if (e.key === 'ArrowLeft' && e.ctrlKey) {
            e.preventDefault();
            const pos = cursorPos;
            if (pos > 0) {
                let newPos = pos - 1;
                while (newPos > 0 && input[newPos] === ' ') newPos--;
                while (newPos > 0 && input[newPos - 1] !== ' ') newPos--;
                setCursorPos(newPos);
                target.setSelectionRange(newPos, newPos);
            }
            return;
        }

        if (e.key === 'ArrowRight' && e.ctrlKey) {
            e.preventDefault();
            const pos = cursorPos;
            if (pos < input.length) {
                let newPos = pos;
                while (newPos < input.length && input[newPos] !== ' ') newPos++;
                while (newPos < input.length && input[newPos] === ' ') newPos++;
                setCursorPos(newPos);
                target.setSelectionRange(newPos, newPos);
            }
            return;
        }

        // Home/End
        if (e.key === 'Home') {
            e.preventDefault();
            setCursorPos(0);
            target.setSelectionRange(0, 0);
            return;
        }

        if (e.key === 'End') {
            e.preventDefault();
            setCursorPos(input.length);
            target.setSelectionRange(input.length, input.length);
            return;
        }

        // Reset history index on typing
        if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
            setHistoryIndex(-1);
        }
    };

    if (isArchDestroyed) {
        return (
            <div className="fixed inset-0 bg-[#1793d1] z-[110] flex flex-col items-center justify-center p-10 font-mono text-white overflow-hidden">
                <div className="max-w-4xl w-full">
                    <div className="text-8xl font-bold mb-10 opacity-20">ARCH_ELITISM</div>
                    <div className="flex gap-10 items-start">
                        <pre className="text-xs leading-none shrink-0 text-white font-bold opacity-80">
                            {`          /\\
         /  \\
        /    \\
       /      \\
      /   ,,   \\
     /   |  |   \\
    /   -|  |-   \\
   /    __\\/__    \\
  /  _-'      '--_ \\
 /_-'             '-\\`}
                        </pre>
                        <div className="space-y-6">
                            <h1 className="text-5xl font-black tracking-tighter italic">I USE ARCH BTW</h1>
                            <div className="bg-white/10 p-6 backdrop-blur-md border border-white/20">
                                <p className="text-xl leading-relaxed">
                                    "Your mere presence in this terminal is an insult to the philosophy of KISS (Keep It Simple, Stupid)."
                                </p>
                            </div>
                            <div className="space-y-2 text-sm opacity-90">
                                <p className="text-red-300 font-bold">CRITICAL_EXCEPTION: NORMIE_DETECTED</p>
                                <p>{">"} Attempting to explain complexity to a Windows user...</p>
                                <p>{">"} Success: User brain has been bricked.</p>
                                <p>{">"} Reason: You didn't compile your browser from source.</p>
                            </div>
                            <div className="pt-10 flex gap-4">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-white text-[#1793d1] px-6 py-2 font-bold hover:bg-zinc-200 transition-colors"
                                >
                                    REFRESH (REBOOT BRAIN)
                                </button>
                                <div className="text-[10px] self-center opacity-50">Only a true Linux Pro (or a refresh) can fix this.</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 p-4 text-[10px] opacity-30">
                    btw i use arch btw i use arch btw i use arch btw i use arch btw i use arch
                </div>
            </div>
        );
    }

    if (isDestroyed) {
        return (
            <div className="fixed inset-0 bg-[#0000aa] z-[100] flex flex-col items-center justify-center p-10 font-mono text-white animate-flicker overflow-hidden">
                <div className="max-w-2xl">
                    <div className="bg-white text-[#0000aa] px-4 py-1 inline-block font-bold mb-10">
                        SYSTEM_ERROR: CORE_DUMPed
                    </div>
                    <h1 className="text-3xl font-bold mb-6">CRITICAL_SYSTEM_FAILURE</h1>
                    <p className="mb-4">
                        A critical error has occurred in the System Node.
                        The recursive deletion command has compromised the integrity of the Blueprint Core.
                    </p>
                    <p className="mb-8 opacity-70">
                        * Data corruption detected in sector 0xFFA1<br />
                        * Neural links disconnected<br />
                        * All production nodes offline<br />
                        * Sudoers file disintegrated
                    </p>
                    <div className="space-y-4">
                        <p>If this is the first time you've seen this stop error screen, restart your brain. If this screen appears again, stop typing `sudo rm -rf /` you geek.</p>
                        <p className="mt-10 animate-pulse">Press any key to attempt neural reboot (or just refresh the page)...</p>
                    </div>
                    <div className="mt-20 opacity-30 text-[10px]">
                        ERROR_CODE: 0xDEADBEEF_BLUE_SCREEN_OF_GEEK
                    </div>
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-10 noise-bg"></div>
                <button
                    className="absolute inset-0 opacity-0 cursor-default"
                    onClick={() => window.location.reload()}
                ></button>
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 bg-black z-50 flex flex-col font-mono text-sm overflow-hidden transition-all duration-300
                ${destructionProgress > 0 && destructionProgress < 100 ? 'animate-flicker' : ''}
                ${destructionProgress > 20 ? 'grayscale-[0.5]' : ''}
                ${destructionProgress > 40 ? 'invert-[0.1]' : ''}
                ${destructionProgress > 60 ? 'grayscale' : ''}
                ${destructionProgress > 80 ? 'invert-[0.2] scale-[0.98]' : ''}
                ${destructionProgress === 100 ? 'scale-0 opacity-0 transition-all duration-1000' : ''}
            `}
        >
            <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                    destructionProgress > (i * 5) && (
                        <div key={i} className="absolute bg-white/20 h-px w-full animate-glitch-line" style={{ top: `${i * 5}%` }}></div>
                    )
                ))}
            </div>
            {isMatrixActive && (
                <canvas
                    ref={canvasRef}
                    className="fixed inset-0 opacity-80 pointer-events-none mix-blend-screen z-0"
                    style={{ filter: 'brightness(1.5) contrast(1.2)' }}
                />
            )}
            {isPipesActive && <canvas ref={pipesRef} className="fixed inset-0 opacity-60 pointer-events-none z-0" />}
            {destructionProgress > 0 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-red-600 text-white px-10 py-5 font-bold animate-pulse shadow-[0_0_50px_rgba(255,0,0,0.5)]">
                    DESTRUCTION_IN_PROGRESS: {destructionProgress}%
                </div>
            )}

            {/* Main Terminal Area */}
            <div
                className={`flex-1 flex flex-col min-h-0 p-4 sm:p-8 bg-black/40 relative z-10 transition-transform force-select ${destructionProgress > 50 ? 'skew-x-2' : ''}`}
                style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
                onMouseUp={() => {
                    const selection = window.getSelection();
                    if (!selection || selection.toString().length === 0) {
                        inputRef.current?.focus();
                    }
                }}
            >
                <div
                    ref={scrollRef}
                    aria-live="polite"
                    className="flex-1 min-h-0 overflow-y-auto space-y-1 scrollbar-hide pb-20 select-text force-select"
                    style={{ overflowAnchor: 'none' }}
                >
                    {lines.map((line, i) => (
                        <TerminalRow
                            key={`line-${i}`}
                            line={line}
                            destructionProgress={destructionProgress}
                        />
                    ))}
                    {liveLines.length > 0 && (
                        <div className="space-y-1">
                            {liveLines.map((line, i) => (
                                <div key={`live-${i}`} className={`
                                    ${line.tight ? 'leading-[0.8] !mt-0' : ''}
                                    ${line.type === 'output' ? 'text-zinc-300' : ''}
                                    ${line.type === 'error' ? 'text-red-500' : ''}
                                    ${line.type === 'success' ? 'text-[var(--accent)]' : ''}
                                    ${line.type === 'system' ? 'text-blue-400 font-bold' : ''}
                                    ${line.type === 'warning' ? 'text-yellow-400' : ''}
                                `}>
                                    {line.text}
                                </div>
                            ))}
                        </div>
                    )
                    }

                    {!isDestroyed && !activeLiveMode && (
                        <form onSubmit={handleCommand} className="flex items-start gap-2 pt-2 select-text">
                            <span className="text-[var(--accent)] font-bold shrink-0">
                                {isRoot ? `root@${config.text.systemName || 'site-control'}:~# ` : `${config.text.username || 'admin'}@${config.text.systemName || 'site-control'}:~$ `}
                            </span>
                            <div className="flex-1 relative block">
                                <textarea
                                    ref={inputRef}
                                    autoFocus
                                    aria-label="Terminal Input"

                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        setCursorPos(e.target.selectionStart || 0);
                                    }}
                                    onClick={(e) => {
                                        setCursorPos(e.currentTarget.selectionStart || 0);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCommand(e as any);
                                        } else {
                                            handleKeyDown(e);
                                        }
                                    }}
                                    onSelect={(e) => setCursorPos(e.currentTarget.selectionStart || 0)}
                                    onKeyUp={(e) => setCursorPos(e.currentTarget.selectionStart || 0)}
                                    onMouseUp={(e) => setCursorPos(e.currentTarget.selectionStart || 0)}
                                    onPaste={(e) => {
                                        e.preventDefault();
                                        const pastedText = e.clipboardData.getData('text');
                                        const lines = pastedText.split('\n');

                                        // Execute all lines except the last one immediately
                                        for (let i = 0; i < lines.length - 1; i++) {
                                            const line = lines[i].trim();
                                            if (line) {
                                                processCommand(line); // No await here to mimic fast paste execution
                                            }
                                        }

                                        // The last line (or the only line) goes into input
                                        const lastLine = lines[lines.length - 1];
                                        if (lastLine) {
                                            const newInput = input.slice(0, cursorPos) + lastLine + input.slice(cursorPos);
                                            setInput(newInput);
                                            setCursorPos(cursorPos + lastLine.length);
                                        }
                                    }}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(true)} // Force focus back
                                    className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent z-10 resize-none overflow-hidden"
                                />
                                <div className="flex items-center pointer-events-none relative z-0">
                                    <span className="text-white whitespace-pre-wrap">{input.slice(0, cursorPos)}</span>
                                    {isFocused && !activeLiveMode && !isDestroyed && (
                                        <span className="w-2 h-4 bg-[var(--accent)] animate-pulse shrink-0" />
                                    )}
                                    <span className="text-white whitespace-pre-wrap">{input.slice(cursorPos)}</span>
                                    {suggestion && suggestion.startsWith(input) && (
                                        <span className="text-zinc-700 opacity-50 whitespace-pre-wrap absolute left-0 top-0 pointer-events-none">
                                            {input}{suggestion.slice(input.length)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Footer / Status Bar */}
            <div className="h-6 bg-zinc-900 border-t border-zinc-800 px-4 flex items-center justify-between text-[8px] text-zinc-600 uppercase font-bold shrink-0 z-10">
                <div className="flex gap-6">
                    <span>CONNECTION: SECURE</span>
                    <span>PROTOCOL: TERMINAL_SSH</span>
                </div>
                <div className="flex gap-6">
                    <span>LN {lines.length}</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
};
