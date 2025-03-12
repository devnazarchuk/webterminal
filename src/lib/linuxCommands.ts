// Linux command handlers for terminal
import { VirtualFileSystem } from './virtualFileSystem';

export interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system' | 'warning';
    tight?: boolean;
}

export class LinuxCommands {
    // File system commands
    static handleLs(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        const result = vfs.ls(args);
        if (!result.success) {
            return [{ text: result.error || 'ls: error', type: 'error' }];
        }
        return result.output.map(line => ({ text: line, type: 'output' }));
    }

    static handleCd(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        const path = args[0] || '~';
        const result = vfs.cd(path);
        if (!result.success) {
            return [{ text: result.error || 'cd: error', type: 'error' }];
        }
        return [];
    }

    static handlePwd(vfs: VirtualFileSystem): TerminalLine[] {
        return [{ text: vfs.pwd(), type: 'output' }];
    }

    static handleMkdir(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        if (args.length === 0) {
            return [{ text: 'mkdir: missing operand', type: 'error' }];
        }
        if (args[0] === '/') {
            return [{ text: "mkdir: cannot create directory '/': File exists. Also, why?", type: 'error' }];
        }
        const result = vfs.mkdir(args[0]);
        if (!result.success) {
            return [{ text: result.error || 'mkdir: error', type: 'error' }];
        }
        return [];
    }

    static handleTouch(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        if (args.length === 0) {
            return [{ text: 'touch: missing file operand', type: 'error' }];
        }
        if (args[0] === '/') {
            return [{ text: "touch: setting times of '/': Permission denied. Root is immutable to mortals.", type: 'error' }];
        }
        const result = vfs.touch(args[0]);
        if (!result.success) {
            return [{ text: result.error || 'touch: error', type: 'error' }];
        }
        return [];
    }

    static handleRm(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        const recursive = args.includes('-r') || args.includes('-rf');
        const files = args.filter(a => !a.startsWith('-'));

        if (files.length === 0) {
            return [{ text: 'rm: missing operand', type: 'error' }];
        }

        const output: TerminalLine[] = [];
        for (const file of files) {
            if (file === '/' && recursive) {
                if (args.includes('--no-preserve-root')) {
                    return [
                        { text: "rm: it is dangerous to operate recursively on '/'", type: 'error' },
                        { text: "Actually, there is no such flag as '--no-preserve-root' in this environment.", type: 'system' },
                        { text: "Did you really think that would help you delete my hard work? Nice try, normie.", type: 'system' }
                    ];
                }
                return [
                    { text: "rm: it is dangerous to operate recursively on '/'", type: 'error' },
                    { text: "rm: use --no-preserve-root to override this failsafe, but you really shouldn't.", type: 'system' },
                    { text: "Actually, why are you trying to delete my system? That's not very nice.", type: 'system' }
                ];
            }
            const result = vfs.rm(file, recursive);
            if (!result.success) {
                output.push({ text: result.error || 'rm: error', type: 'error' });
            }
        }
        return output;
    }

    static handleCat(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        if (args.length === 0) {
            return [{ text: 'cat: missing file operand', type: 'error' }];
        }

        const output: TerminalLine[] = [];
        for (const file of args) {
            const result = vfs.cat(file);
            if (!result.success) {
                output.push({ text: result.error || 'cat: error', type: 'error' });
            } else {
                const lines = (result.content || '').split('\n');
                lines.forEach(line => output.push({ text: line, type: 'output' }));
            }
        }
        return output;
    }

    static handleEcho(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        const text = args.join(' ');
        const redirectMatch = text.match(/^(.+?)\s*(>>?)\s*(.+)$/);
        if (redirectMatch) {
            const [, content, operator, file] = redirectMatch;
            const append = operator === '>>';
            const result = vfs.echo(content.trim(), file.trim(), append);
            if (!result.success) {
                return [{ text: result.error || 'echo: error', type: 'error' }];
            }
            return [];
        }
        return [{ text: text, type: 'output' }];
    }

    // System information commands
    static handleUname(args: string[]): TerminalLine[] {
        const showAll = args.includes('-a') || args.includes('--all');
        const showKernel = args.includes('-s') || args.includes('--kernel-name');
        const showRelease = args.includes('-r') || args.includes('--kernel-release');
        const showVersion = args.includes('-v') || args.includes('--kernel-version');
        const showMachine = args.includes('-m') || args.includes('--machine');

        if (showAll) {
            return [{ text: 'Linux site-control 5.15.0-generic #1 SMP x86_64 GNU/Linux', type: 'output' }];
        }
        if (showMachine) return [{ text: 'x86_64', type: 'output' }];
        if (showRelease) return [{ text: '5.15.0-generic', type: 'output' }];
        if (showVersion) return [{ text: '#1 SMP Mon Feb 14 08:23:42 UTC 2025', type: 'output' }];
        if (showKernel) return [{ text: 'Linux', type: 'output' }];

        return [{ text: 'Linux', type: 'output' }];
    }

    static handleUptime(): TerminalLine[] {
        const uptime = Math.floor(Math.random() * 86400);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        return [{
            text: `up ${hours}:${minutes.toString().padStart(2, '0')}, 1 user, load average: ${(Math.random() * 1).toFixed(2)}, ${(Math.random() * 1).toFixed(2)}, ${(Math.random() * 1).toFixed(2)}`,
            type: 'output'
        }];
    }

    static handleFree(): TerminalLine[] {
        const total = 8192000;
        const used = 3000000 + Math.floor(Math.random() * 2000000);
        const free = total - used;
        const shared = 524288;
        const buff = 851968;
        const avail = free + buff;

        return [
            { text: '              total        used        free      shared  buff/cache   available', type: 'output' },
            { text: `Mem:        ${total}     ${used}     ${free}      ${shared}      ${buff}     ${avail}`, type: 'output' },
            { text: 'Swap:       2097152           0     2097152', type: 'output' },
        ];
    }

    static handleDf(): TerminalLine[] {
        const total = 51474912;
        const used = 8000000 + Math.floor(Math.random() * 1000000);
        const avail = total - used;
        const perc = Math.floor((used / total) * 100);

        return [
            { text: 'Filesystem     1K-blocks    Used Available Use% Mounted on', type: 'output' },
            { text: `/dev/sda1       ${total} ${used}  ${avail}  ${perc}% /`, type: 'output' },
            { text: 'tmpfs            4096000       0   4096000   0% /tmp', type: 'output' },
        ];
    }

    static handlePs(): TerminalLine[] {
        return [
            { text: '  PID TTY          TIME CMD', type: 'output' },
            { text: '    1 pts/0    00:00:00 init', type: 'output' },
            { text: '   42 pts/0    00:00:01 terminal', type: 'output' },
            { text: '  128 pts/0    00:00:00 node', type: 'output' },
            { text: `  ${200 + Math.floor(Math.random() * 100)} pts/0    00:00:00 ps`, type: 'output' },
        ];
    }

    static handleTop(): TerminalLine[] {
        const cpuUs = (Math.random() * 5).toFixed(1);
        const cpuSy = (Math.random() * 2).toFixed(1);
        const cpuId = (100 - parseFloat(cpuUs) - parseFloat(cpuSy)).toFixed(1);

        return [
            { text: `top - ${new Date().toLocaleTimeString()} up ... load average: ${(Math.random() * 1).toFixed(2)}, ${(Math.random() * 1).toFixed(2)}`, type: 'output' },
            { text: 'Tasks: 4 total, 1 running, 3 sleeping', type: 'output' },
            { text: `%Cpu(s): ${cpuUs} us, ${cpuSy} sy, 0.0 ni, ${cpuId} id`, type: 'output' },
            { text: 'MiB Mem : 8000.0 total, 4096.0 free, 3072.0 used', type: 'output' },
            { text: '', type: 'output' },
            { text: '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', type: 'output' },
            { text: `  128 user      20   0  612288  51200  12800 S   ${(Math.random() * 3).toFixed(1)}   0.6   0:01.23 node`, type: 'output' },
            { text: `   42 user      20   0  204800  20480   8192 R   ${(Math.random() * 2).toFixed(1)}   0.3   0:00.45 terminal`, type: 'output' },
        ];
    }

    static handleHtop(): TerminalLine[] {
        const cpu1 = Math.floor(Math.random() * 100);
        const cpu2 = Math.floor(Math.random() * 100);
        const memPerc = Math.floor((3.2 / 7.82) * 100);

        const cpuBar = (p: number) => {
            const bars = Math.floor(p / 4);
            return '[' + '|'.repeat(bars).padEnd(25) + ` ${p.toFixed(1)}%]`;
        };

        return [
            { text: `  1  ${cpuBar(cpu1)}   Tasks: ${40 + Math.floor(Math.random() * 10)}, 1 thr; 1 running`, type: 'success' },
            { text: `  2  ${cpuBar(cpu2)}   Load average: ${(Math.random() * 1).toFixed(2)} ${(Math.random() * 1).toFixed(2)}`, type: 'success' },
            { text: `  Mem[${'|'.repeat(Math.floor(memPerc / 4)).padEnd(25)} 3.20G/7.82G]`, type: 'success' },
            { text: "  Swp[|                            10.0M/2.00G]", type: 'success' },
            { text: "", type: 'output' },
            { text: "  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command", type: 'output' },
            { text: `  128 user       20   0  612M 51.2M 12.8M S  ${(Math.random() * 2).toFixed(1)}  0.6  0:01.23 /usr/bin/node`, type: 'output' },
            { text: `   42 user       20   0  204M 20.4M  8.1M R  ${(Math.random() * 1).toFixed(1)}  0.3  0:00.45 /usr/bin/terminal`, type: 'output' },
        ];
    }

    // Utility commands
    static handleHistory(history: string[]): TerminalLine[] {
        return history.map((cmd, i) => ({
            text: `${(i + 1).toString().padStart(4)} ${cmd}`,
            type: 'output'
        }));
    }

    static handleMan(args: string[]): TerminalLine[] {
        if (args.length === 0) {
            return [{ text: 'What manual page do you want?', type: 'error' }];
        }
        const command = args[0];
        const manPages: Record<string, string[]> = {
            ls: [
                'NAME', '    ls - list directory contents', '',
                'SYNOPSIS', '    ls [OPTION]...', '',
                'DESCRIPTION', '    List information about files and directories.',
                '    -l     use a long listing format',
                '    -a     do not ignore entries starting with .',
                '    -la    show everything, always.'
            ],
            cd: [
                'NAME', '    cd - change directory', '',
                'SYNOPSIS', '    cd [DIRECTORY]', '',
                'DESCRIPTION', '    Change the current directory to DIRECTORY.',
                '    "cd .." goes back, "cd ~" goes home.'
            ],
            rm: [
                'NAME', '    rm - remove files or directories', '',
                'SYNOPSIS', '    rm [OPTION]... [FILE]...', '',
                'DESCRIPTION', '    Remove the specified file(s).',
                '    -r, -rf    remove directories and their contents recursively.',
                '',
                'WARNING', '    Using "rm -rf /" is a great way to restart your life.'
            ],
            cat: [
                'NAME', '    cat - concatenate and print files', '',
                'SYNOPSIS', '    cat [FILE]...', '',
                'DESCRIPTION', '    Read files and output their content.'
            ],
            echo: [
                'NAME', '    echo - display a line of text', '',
                'DESCRIPTION', '    Print the arguments to standard output.',
                '    Supports ">" and ">>" redirection.'
            ],
            mkdir: [
                'NAME', '    mkdir - make directories', '',
                'DESCRIPTION', '    Create a new directory if it does not already exist.'
            ],
            touch: [
                'NAME', '    touch - change file timestamps', '',
                'DESCRIPTION', '    Update access/modification times or create empty file.'
            ],
            pwd: [
                'NAME', '    pwd - print name of working directory', '',
                'DESCRIPTION', '    Show exactly where you are in the machine.'
            ],
            uname: [
                'NAME', '    uname - print system information', '',
                'SYNOPSIS', '    uname [OPTION]...', '',
                'DESCRIPTION', '    Print information about the kernel and machine.',
                '    -a, --all              print all information',
                '    -s, --kernel-name      print kernel name',
                '    -r, --kernel-release   print kernel release',
                '    -v, --kernel-version   print kernel version',
                '    -m, --machine          print machine hardware name'
            ],
            uptime: [
                'NAME', '    uptime - tell how long the system has been running', '',
                'DESCRIPTION', '    Show how long the system has been up and current load.'
            ],
            free: [
                'NAME', '    free - display amount of free and used memory', '',
                'DESCRIPTION', '    Show the system memory consumption in blocks.'
            ],
            df: [
                'NAME', '    df - report file system disk space usage', '',
                'DESCRIPTION', '    Show available space on mounted partitions.'
            ],
            ps: [
                'NAME', '    ps - report a snapshot of current processes', '',
                'DESCRIPTION', '    Show what is currently running in your terminal.'
            ],
            top: [
                'NAME', '    top - display Linux processes', '',
                'DESCRIPTION', '    Interactive process viewer. Use Ctrl+C to exit.'
            ],
            htop: [
                'NAME', '    htop - interactive process viewer', '',
                'DESCRIPTION', '    A better version of top with colors. Use Ctrl+C to exit.'
            ],
            grep: [
                'NAME', '    grep - print lines matching a pattern', '',
                'SYNOPSIS', '    grep PATTERN FILE', '',
                'DESCRIPTION', '    Search for PATTERN in FILE.'
            ],
            find: [
                'NAME', '    find - search for files in a directory hierarchy', '',
                'DESCRIPTION', '    A simplified version that lists everything.'
            ],
            wc: [
                'NAME', '    wc - print newline, word, and byte counts', '',
                'DESCRIPTION', '    Show statistics for the content of a file.'
            ],
            ping: [
                'NAME', '    ping - send ICMP ECHO_REQUEST to network hosts', '',
                'DESCRIPTION', '    Check connection to a host. Supports custom count with -c.'
            ],
            curl: [
                'NAME', '    curl - transfer a URL', '',
                'DESCRIPTION', '    Simulate fetching web content.'
            ],
            wget: [
                'NAME', '    wget - non-interactive network downloader', '',
                'DESCRIPTION', '    Download files from URLs into the local VFS.'
            ],
            sudo: [
                'NAME', '    sudo - execute a command as another user', '',
                'DESCRIPTION', '    Pretend you have power. Use "sudo su" for root.',
                '',
                'ADVICE', '    Great power comes with great responsibility.'
            ],
            neofetch: [
                'NAME', '    neofetch - system information tool', '',
                'DESCRIPTION', '    The hallmark of a Linux user. ASCII art + stats.'
            ],
            matrix: [
                'NAME', '    matrix - toggle digital rain effect', '',
                'SYNOPSIS', '    matrix [COLOR]', '',
                'DESCRIPTION', '    Toggle the matrix effect. Pass a hex color to customize.'
            ],
            pipes: [
                'NAME', '    pipes - toggle animated pipes effect', '',
                'DESCRIPTION', '    A recursive animation of growing pipes.'
            ],
            iusearchbtw: [
                'NAME', '    iusearchbtw - the ultimate flex', '',
                'DESCRIPTION', '    Initiates the Arch user elitism protocol.',
                '    WARNING: Only for true linux chads.'
            ]
        };
        const page = manPages[command];
        if (!page) return [{ text: `No manual entry for ${command}`, type: 'error' }];
        return page.map(line => ({ text: line, type: 'output' }));
    }

    static handleGrep(args: string[], vfs: VirtualFileSystem): TerminalLine[] {
        if (args.length < 2) return [{ text: 'Usage: grep PATTERN FILE', type: 'error' }];
        const patternStr = args[0];
        const file = args[1];
        const result = vfs.cat(file);
        if (!result.success) return [{ text: `grep: ${file}: No such file or directory`, type: 'error' }];
        const lines = (result.content || '').split('\n');
        try {
            const regex = new RegExp(patternStr, 'i');
            return lines.filter(l => regex.test(l)).map(l => ({ text: l, type: 'output' }));
        } catch (e) {
            return [{ text: "grep: invalid regular expression", type: 'error' }];
        }
    }

    static handleFind(vfs: VirtualFileSystem, args: string[]): TerminalLine[] {
        const result = vfs.ls(['-la']);
        return result.output.map(line => ({ text: line, type: 'output' }));
    }

    static handleWc(args: string[], vfs: VirtualFileSystem): TerminalLine[] {
        if (args.length === 0) return [{ text: 'wc: missing file', type: 'error' }];
        const result = vfs.cat(args[0]);
        if (!result.success) return [{ text: result.error || 'wc: error', type: 'error' }];
        const content = result.content || '';
        const lines = content.split('\n').length - 1;
        const words = content.split(/\s+/).filter(w => w).length;
        const chars = content.length;
        return [{ text: `${lines.toString().padStart(8)} ${words.toString().padStart(8)} ${chars.toString().padStart(8)} ${args[0]}`, type: 'output' }];
    }

    static handlePing(args: string[]): TerminalLine[] {
        if (args.length === 0) return [{ text: 'ping: missing host', type: 'error' }];

        let host = args.filter(a => !a.startsWith('-'))[0];
        if (!host) return [{ text: 'ping: missing host', type: 'error' }];

        const countArgIdx = args.indexOf('-c');
        const count = countArgIdx !== -1 ? parseInt(args[countArgIdx + 1]) || 3 : 3;

        if (host === 'google.com') {
            return [
                { text: `PING google.com (142.250.184.206) 56(84) bytes of data.`, type: 'output' },
                { text: `64 bytes from fra16s48-in-f14.1e100.net: icmp_seq=1 ttl=115 time=12.4 ms`, type: 'output' },
                { text: `Error: Google is too big to ping. Try pinging your own ego.`, type: 'error' }
            ];
        }

        const lines: TerminalLine[] = [
            { text: `PING ${host} (127.0.0.1) 56(84) bytes of data.`, type: 'output' }
        ];

        for (let i = 1; i <= count; i++) {
            lines.push({ text: `64 bytes from ${host} (127.0.0.1): icmp_seq=${i} ttl=64 time=${(0.04 + Math.random() * 0.02).toFixed(3)} ms`, type: 'output' });
        }

        lines.push({ text: `--- ${host} ping statistics ---`, type: 'output' });
        lines.push({ text: `${count} packets transmitted, ${count} received, 0% packet loss, time ${count * 1000}ms`, type: 'output' });

        return lines;
    }

    static handleCurl(args: string[]): TerminalLine[] {
        if (args.length === 0) return [{ text: "curl: try 'curl --help' for more information", type: 'error' }];
        return [
            { text: `<!DOCTYPE html>`, type: 'output' },
            { text: `<html lang="en">`, type: 'output' },
            { text: `<head><title>Simulated Response: ${args[0]}</title></head>`, type: 'output' },
            { text: `<body><h1>Hello from ${args[0]}</h1><p>Terminal integrated node active.</p></body>`, type: 'output' },
            { text: `</html>`, type: 'output' },
        ];
    }

    static handleWget(args: string[], vfs: VirtualFileSystem): TerminalLine[] {
        if (args.length === 0) return [{ text: 'wget: missing URL', type: 'error' }];
        const url = args[0];
        const filename = url.split('/').pop() || 'index.html';
        vfs.touch(filename);
        return [
            { text: `--2025-02-14 08:23:42--  ${url}`, type: 'output' },
            { text: `Resolving hostname... connected.`, type: 'output' },
            { text: `Length: 1256 (1.2K) [text/html]`, type: 'output' },
            { text: `Saving to: '${filename}'`, type: 'output' },
            { text: `2025-02-14 08:23:42 (100 MB/s) - '${filename}' saved`, type: 'success' },
        ];
    }

    static handleSort(args: string[], vfs: VirtualFileSystem): TerminalLine[] {
        if (args.length === 0) return [{ text: 'sort: missing file', type: 'error' }];
        const result = vfs.cat(args[0]);
        if (!result.success) return [{ text: `sort: ${args[0]}: No such file`, type: 'error' }];
        const lines = (result.content || '').split('\n').filter(l => l).sort();
        return lines.map(line => ({ text: line, type: 'output' }));
    }

    static handleWhich(args: string[]): TerminalLine[] {
        if (args.length === 0) return [];
        const builtins = ['ls', 'cd', 'pwd', 'mkdir', 'touch', 'rm', 'cat', 'echo', 'uname', 'uptime', 'free', 'df', 'ps', 'top', 'htop', 'history', 'man', 'grep', 'find', 'wc', 'whoami', 'help', 'clear', 'sudo', 'neofetch', 'matrix', 'pipes'];
        if (builtins.includes(args[0])) return [{ text: `/usr/bin/${args[0]}`, type: 'output' }];
        return [];
    }

    static handleEnv(): TerminalLine[] {
        return [
            { text: 'SHELL=/bin/bash', type: 'output' },
            { text: 'TERM=xterm-256color', type: 'output' },
            { text: 'USER=admin', type: 'output' },
            { text: 'HOME=/home/admin', type: 'output' },
            { text: 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', type: 'output' },
            { text: 'LC_ALL=en_US.UTF-8', type: 'output' },
        ];
    }

    static handleWhoami(config: any): TerminalLine[] {
        const user = config.text.username || 'admin';
        if (user === 'root') {
            return [{ text: "You are God. (root)", type: 'success' }];
        }
        return [{ text: user, type: 'output' }];
    }

    static handleNeofetch(config: any): TerminalLine[] {
        const platform = typeof window !== 'undefined' ? (window.navigator as any).userAgentData?.platform || window.navigator.platform : 'Linux';
        const resolution = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : '1920x1080';

        const logo = [
            "      ▲       ",
            "     ▲ ▲      ",
            "    ▲   ▲     ",
            "   ▲     ▲    ",
            "  ▲       ▲   ",
            " ▲         ▲  ",
            "▲           ▲ ",
            "━━━━━━━━━━━━━ "
        ];

        const info = [
            { label: 'USER', value: config.text.username || 'admin', color: 'success' },
            { label: 'HOST', value: config.text.systemName || 'site-control', color: 'system' },
            { label: 'OS', value: `Arch-Pulse v3.0 (${platform})`, color: 'system' },
            { label: 'RES', value: resolution, color: 'output' },
            { label: 'THEME', value: config.colors.accent === '#00ff00' ? 'Classic Hacker' : 'Custom Palette', color: 'success' },
            { label: 'SHELL', value: 'bash 5.1', color: 'system' },
            { label: 'WM', value: 'i3-gecko', color: 'output' },
            { label: 'CPU', value: 'Cloud-Instance vCpu (8)', color: 'output' }
        ];

        const output: TerminalLine[] = [];
        const maxLines = Math.max(logo.length, info.length);

        for (let i = 0; i < maxLines; i++) {
            const logoPart = logo[i] || " ".repeat(14);
            const infoPart = info[i];
            const lineText = infoPart ? `${logoPart}  ${infoPart.label.padEnd(8)} : ${infoPart.value}` : logoPart;
            output.push({ text: lineText, type: (infoPart?.color || 'output') as any });
        }
        return output;
    }

    static handleSudo(args: string[], config: any): { lines: TerminalLine[], startDestruction?: boolean } {
        if (args.length === 0) return { lines: [{ text: "usage: sudo command", type: 'error' }] };
        const fullCmd = args.join(' ');
        const username = config.text.username || 'admin';
        if (fullCmd === 'rm -rf /' || fullCmd === 'rm -rf /*') {
            return {
                lines: [
                    { text: `[sudo] password for ${username}: `, type: 'system' },
                    { text: "Password accepted.", type: 'success' },
                    { text: "WARNING: You are about to destroy the entire system node.", type: 'error' },
                    { text: "Commencing recursive deletion...", type: 'output' },
                ],
                startDestruction: true
            };
        }
        return { lines: [{ text: `${username} is not in the sudoers file. This incident will be reported.`, type: 'error' }] };
    }

    static handleApropos(args: string[]): TerminalLine[] {
        return [
            { text: "matrix (1) - digital rain simulation", type: 'output' },
            { text: "pipes (1) - animated screensaver", type: 'output' },
            { text: "neofetch (1) - system info", type: 'output' },
            { text: "htop (1) - interactive process viewer", type: 'output' },
            { text: "top (1) - process monitor", type: 'output' },
            { text: "goto (1) - fast navigation between site nodes", type: 'output' },
            { text: "theme (1) - visual customization", type: 'output' },
            { text: "iusearchbtw (1) - the elitist flex command", type: 'output' },
            { text: "sl (1) - steam locomotive", type: 'output' },
            { text: "fortune (1) - get a lucky message", type: 'output' },
            { text: "cowsay (1) - let the cow speak", type: 'output' },
            { text: "figlet (1) - text font banners", type: 'output' },
        ];
    }

    static handleDmesg(): TerminalLine[] {
        return [
            { text: "[    0.000000] Linux version 5.15.0-generic (arch-pulse)", type: 'system' },
            { text: "[    1.120485] input: Power Button as /devices/input/input0", type: 'system' },
            { text: "[    4.875123] EXT4-fs (sda1): mounted filesystem", type: 'system' },
            { text: "[    6.999999] ERROR: User is being too curious.", type: 'error' },
            { text: "[    7.200000] System Node: ONLINE", type: 'success' }
        ];
    }

    static handleIUseArchBTW(): { lines: TerminalLine[], startArchDestruction?: boolean } {
        return {
            lines: [
                { text: "B T W", type: 'success' },
                { text: "I", type: 'success' },
                { text: "U S E", type: 'success' },
                { text: "A R C H", type: 'success' },
                { text: "---------------------------------", type: 'system' },
                { text: "Checking elitism level...", type: 'output' },
                { text: "Status: CHAD DETECTED", type: 'success' },
                { text: "Error: System cannot handle this much superiority.", type: 'error' },
                { text: "[DANGER] Compiled software detected in real-time.", type: 'error' },
                { text: "[DANGER] KISS principal violated by existence.", type: 'error' },
                { text: "Kernel Panic: ElitismOverflowException", type: 'error' },
                { text: "System is bricking. Only a Master of the Command Line can save this.", type: 'system' },
                { text: "HINT: The emergency override command is 'pacman -Syu --fix-everything'", type: 'system' },
            ],
            startArchDestruction: true
        };
    }
}
