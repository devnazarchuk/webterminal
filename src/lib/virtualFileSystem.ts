// Virtual File System for Terminal
export interface VFSNode {
    name: string;
    type: 'file' | 'directory';
    content?: string;
    children?: Map<string, VFSNode>;
    permissions: string;
    owner: string;
    size: number;
    modified: Date;
}

export class VirtualFileSystem {
    private root: VFSNode;
    private currentPath: string[];

    constructor() {
        this.currentPath = [];
        this.root = this.createDefaultStructure();
    }

    private createDefaultStructure(): VFSNode {
        const now = new Date();

        return {
            name: '/',
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'root',
            size: 4096,
            modified: now,
            children: new Map([
                ['home', {
                    name: 'home',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    size: 4096,
                    modified: now,
                    children: new Map([
                        ['user', {
                            name: 'user',
                            type: 'directory',
                            permissions: 'drwxr-xr-x',
                            owner: 'user',
                            size: 4096,
                            modified: now,
                            children: new Map([
                                ['README.md', {
                                    name: 'README.md',
                                    type: 'file',
                                    content: '# Welcome to the Terminal\n\nThis is a virtual file system.\nYou can create files and directories using standard Linux commands.\n\nTry: ls, cd, pwd, mkdir, touch, cat, echo',
                                    permissions: '-rw-r--r--',
                                    owner: 'user',
                                    size: 150,
                                    modified: now,
                                }],
                                ['projects', {
                                    name: 'projects',
                                    type: 'directory',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'user',
                                    size: 4096,
                                    modified: now,
                                    children: new Map([
                                        ['system.txt', {
                                            name: 'system.txt',
                                            type: 'file',
                                            content: 'Next.js System Website\nFeatures: Terminal UI, 3D Graphics, Customization',
                                            permissions: '-rw-r--r--',
                                            owner: 'user',
                                            size: 75,
                                            modified: now,
                                        }],
                                    ]),
                                }],
                                ['documents', {
                                    name: 'documents',
                                    type: 'directory',
                                    permissions: 'drwxr-xr-x',
                                    owner: 'user',
                                    size: 4096,
                                    modified: now,
                                    children: new Map(),
                                }],
                            ]),
                        }],
                    ]),
                }],
                ['etc', {
                    name: 'etc',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    size: 4096,
                    modified: now,
                    children: new Map([
                        ['hostname', {
                            name: 'hostname',
                            type: 'file',
                            content: 'site-control',
                            permissions: '-rw-r--r--',
                            owner: 'root',
                            size: 12,
                            modified: now,
                        }],
                    ]),
                }],
                ['var', {
                    name: 'var',
                    type: 'directory',
                    permissions: 'drwxr-xr-x',
                    owner: 'root',
                    size: 4096,
                    modified: now,
                    children: new Map([
                        ['log', {
                            name: 'log',
                            type: 'directory',
                            permissions: 'drwxr-xr-x',
                            owner: 'root',
                            size: 4096,
                            modified: now,
                            children: new Map(),
                        }],
                    ]),
                }],
                ['tmp', {
                    name: 'tmp',
                    type: 'directory',
                    permissions: 'drwxrwxrwx',
                    owner: 'root',
                    size: 4096,
                    modified: now,
                    children: new Map(),
                }],
            ]),
        };
    }

    // Get current working directory
    pwd(): string {
        return '/' + this.currentPath.join('/');
    }

    // Navigate to directory
    cd(path: string): { success: boolean; error?: string } {
        if (!path || path === '~') {
            this.currentPath = ['home', 'user'];
            return { success: true };
        }

        if (path === '/') {
            this.currentPath = [];
            return { success: true };
        }

        if (path === '..') {
            if (this.currentPath.length > 0) {
                this.currentPath.pop();
            }
            return { success: true };
        }

        if (path === '.') {
            return { success: true };
        }

        // Handle absolute paths
        if (path.startsWith('/')) {
            const parts = path.slice(1).split('/').filter(p => p);
            const node = this.getNodeByPath(parts);
            if (!node) {
                return { success: false, error: `cd: ${path}: No such file or directory` };
            }
            if (node.type !== 'directory') {
                return { success: false, error: `cd: ${path}: Not a directory` };
            }
            this.currentPath = parts;
            return { success: true };
        }

        // Handle relative paths
        const newPath = [...this.currentPath, ...path.split('/').filter(p => p && p !== '.')];
        const node = this.getNodeByPath(newPath);
        if (!node) {
            return { success: false, error: `cd: ${path}: No such file or directory` };
        }
        if (node.type !== 'directory') {
            return { success: false, error: `cd: ${path}: Not a directory` };
        }
        this.currentPath = newPath;
        return { success: true };
    }

    // List directory contents
    ls(args: string[] = []): { success: boolean; output: string[]; error?: string } {
        const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');

        const currentNode = this.getCurrentNode();
        if (!currentNode || currentNode.type !== 'directory') {
            return { success: false, output: [], error: 'Not a directory' };
        }

        const output: string[] = [];
        const entries = Array.from(currentNode.children?.entries() || []);

        if (longFormat) {
            let total = 0;
            entries.forEach(([_, node]) => {
                total += Math.ceil(node.size / 1024);
            });
            output.push(`total ${total}`);

            entries.forEach(([name, node]) => {
                if (!showHidden && name.startsWith('.')) return;

                const date = node.modified.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                output.push(
                    `${node.permissions} 1 ${node.owner.padEnd(8)} ${node.owner.padEnd(8)} ${String(node.size).padStart(5)} ${date} ${name}`
                );
            });
        } else {
            const names = entries
                .filter(([name]) => showHidden || !name.startsWith('.'))
                .map(([name, node]) => node.type === 'directory' ? name + '/' : name);
            output.push(names.join('  '));
        }

        return { success: true, output };
    }

    // Create directory
    mkdir(path: string): { success: boolean; error?: string } {
        if (!path) {
            return { success: false, error: 'mkdir: missing operand' };
        }

        const parts = path.split('/').filter(p => p);
        const dirName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1);

        const parent = parentPath.length > 0
            ? this.getNodeByPath([...this.currentPath, ...parentPath])
            : this.getCurrentNode();

        if (!parent || parent.type !== 'directory') {
            return { success: false, error: `mkdir: cannot create directory '${path}': No such file or directory` };
        }

        if (parent.children?.has(dirName)) {
            return { success: false, error: `mkdir: cannot create directory '${path}': File exists` };
        }

        parent.children?.set(dirName, {
            name: dirName,
            type: 'directory',
            permissions: 'drwxr-xr-x',
            owner: 'user',
            size: 4096,
            modified: new Date(),
            children: new Map(),
        });

        return { success: true };
    }

    // Create file
    touch(path: string): { success: boolean; error?: string } {
        if (!path) {
            return { success: false, error: 'touch: missing file operand' };
        }

        const parts = path.split('/').filter(p => p);
        const fileName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1);

        const parent = parentPath.length > 0
            ? this.getNodeByPath([...this.currentPath, ...parentPath])
            : this.getCurrentNode();

        if (!parent || parent.type !== 'directory') {
            return { success: false, error: `touch: cannot touch '${path}': No such file or directory` };
        }

        if (parent.children?.has(fileName)) {
            // Update modified time
            const existing = parent.children.get(fileName);
            if (existing) {
                existing.modified = new Date();
            }
        } else {
            parent.children?.set(fileName, {
                name: fileName,
                type: 'file',
                content: '',
                permissions: '-rw-r--r--',
                owner: 'user',
                size: 0,
                modified: new Date(),
            });
        }

        return { success: true };
    }

    // Remove file or directory
    rm(path: string, recursive: boolean = false): { success: boolean; error?: string } {
        if (!path) {
            return { success: false, error: 'rm: missing operand' };
        }

        const parts = path.split('/').filter(p => p);
        const itemName = parts[parts.length - 1];
        const parentPath = parts.slice(0, -1);

        const parent = parentPath.length > 0
            ? this.getNodeByPath([...this.currentPath, ...parentPath])
            : this.getCurrentNode();

        if (!parent || parent.type !== 'directory') {
            return { success: false, error: `rm: cannot remove '${path}': No such file or directory` };
        }

        const item = parent.children?.get(itemName);
        if (!item) {
            return { success: false, error: `rm: cannot remove '${path}': No such file or directory` };
        }

        if (item.type === 'directory' && !recursive) {
            return { success: false, error: `rm: cannot remove '${path}': Is a directory (use -r for recursive)` };
        }

        parent.children?.delete(itemName);
        return { success: true };
    }

    // Read file contents
    cat(path: string): { success: boolean; content?: string; error?: string } {
        const node = this.getNodeByRelativePath(path);

        if (!node) {
            return { success: false, error: `cat: ${path}: No such file or directory` };
        }

        if (node.type !== 'file') {
            return { success: false, error: `cat: ${path}: Is a directory` };
        }

        return { success: true, content: node.content || '' };
    }

    // Write to file (echo)
    echo(content: string, path?: string, append: boolean = false): { success: boolean; error?: string } {
        if (!path) {
            return { success: true }; // Just echo to stdout
        }

        const node = this.getNodeByRelativePath(path);

        if (node && node.type !== 'file') {
            return { success: false, error: `echo: ${path}: Is a directory` };
        }

        if (!node) {
            // Create new file
            const result = this.touch(path);
            if (!result.success) {
                return result;
            }
        }

        const fileNode = this.getNodeByRelativePath(path);
        if (fileNode && fileNode.type === 'file') {
            fileNode.content = append
                ? (fileNode.content || '') + content + '\n'
                : content + '\n';
            fileNode.size = fileNode.content.length;
            fileNode.modified = new Date();
        }

        return { success: true };
    }

    // Helper methods
    private getCurrentNode(): VFSNode | null {
        return this.getNodeByPath(this.currentPath);
    }

    private getNodeByPath(path: string[]): VFSNode | null {
        let current: VFSNode | null = this.root;

        for (const part of path) {
            if (part === '..') {
                // Handle going up - would need parent tracking
                continue;
            }
            if (part === '.' || part === '') {
                continue;
            }
            if (!current || current.type !== 'directory' || !current.children) {
                return null;
            }
            current = current.children.get(part) || null;
            if (!current) return null;
        }

        return current;
    }

    private getNodeByRelativePath(path: string): VFSNode | null {
        if (path.startsWith('/')) {
            return this.getNodeByPath(path.slice(1).split('/').filter(p => p));
        }
        return this.getNodeByPath([...this.currentPath, ...path.split('/').filter(p => p)]);
    }

    // Get current path for display
    getCurrentPath(): string[] {
        return [...this.currentPath];
    }

    // Reset to home directory
    resetToHome(): void {
        this.currentPath = ['home', 'user'];
    }
}
