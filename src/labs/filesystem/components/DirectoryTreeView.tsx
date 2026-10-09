/**
 * OScope — Virtual Directory Tree & VFS Navigation Component
 * Hierarchical representation of directories and files with Inode bindings,
 * path navigation, and pure block reclamation deletion actions.
 */

import React from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Trash2,
  FolderPlus,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { Card, Button } from '../../../components/common';
import { useFileSystemStore } from '../../../state/useFileSystemStore';

export const DirectoryTreeView: React.FC = () => {
  const state = useFileSystemStore((s) => s.state);
  const selectedFilePath = useFileSystemStore((s) => s.selectedFilePath);
  const currentDirectory = useFileSystemStore((s) => s.currentDirectory);
  const selectFile = useFileSystemStore((s) => s.selectFile);
  const setCurrentDirectory = useFileSystemStore((s) => s.setCurrentDirectory);
  const executeFileDeletion = useFileSystemStore((s) => s.executeFileDeletion);
  const executeCreateDirectory = useFileSystemStore((s) => s.executeCreateDirectory);

  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({
    '/': true,
    '/home': true,
    '/home/ohi': true,
    '/system': true,
  });

  const [isCreatingDir, setIsCreatingDir] = React.useState(false);
  const [newDirName, setNewDirName] = React.useState('');

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Group directory entries into hierarchical tree
  // Collect all directories
  const directories = React.useMemo(() => {
    const list = state.directoryEntries.filter((e) => e.type === 'DIRECTORY');
    const paths = new Set<string>(['/']);
    list.forEach((d) => paths.add(d.path));
    return Array.from(paths).sort();
  }, [state.directoryEntries]);

  const handleCreateDirectory = () => {
    if (!newDirName.trim()) return;
    const ok = executeCreateDirectory(currentDirectory, newDirName.trim());
    if (ok) {
      setNewDirName('');
      setIsCreatingDir(false);
      setExpandedFolders((prev) => ({ ...prev, [currentDirectory]: true }));
    }
  };

  return (
    <Card padding="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FolderOpen size={16} color="var(--color-accent)" />
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>
              Virtual File System (VFS)
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<FolderPlus size={12} />}
            onClick={() => setIsCreatingDir(!isCreatingDir)}
          >
            New Folder
          </Button>
        </div>

        {/* Current Working Directory Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            padding: '4px 8px',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
          }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>CWD:</span>
          <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{currentDirectory}</span>
        </div>

        {/* Inline Create Directory Box */}
        {isCreatingDir && (
          <div
            style={{
              padding: '8px',
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-accent)' }}>
              Create subdirectory inside "{currentDirectory}":
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                value={newDirName}
                onChange={(e) => setNewDirName(e.target.value)}
                placeholder="folder_name"
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateDirectory();
                }}
              />
              <Button variant="primary" size="sm" onClick={handleCreateDirectory}>
                Add
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsCreatingDir(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Tree Entries */}
        <div
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {directories.map((dirPath) => {
            const isRoot = dirPath === '/';
            const dirName = isRoot ? '/' : dirPath.split('/').pop() ?? dirPath;
            const depth = isRoot ? 0 : dirPath.split('/').filter(Boolean).length;
            const isExpanded = expandedFolders[dirPath] ?? true;
            const isCwd = currentDirectory === dirPath;

            // Find all direct children files of this directory
            const directFiles = state.directoryEntries.filter((e) => {
              if (e.type !== 'FILE') return false;
              if (isRoot) {
                // files directly under root e.g. /file.txt (only one slash)
                const parts = e.path.split('/').filter(Boolean);
                return parts.length === 1;
              }
              const parent = e.path.substring(0, e.path.lastIndexOf('/'));
              return parent === dirPath;
            });

            return (
              <div key={dirPath} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* Directory Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    paddingLeft: `${depth * 16 + 4}px`,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isCwd ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                  }}
                  onClick={() => {
                    toggleFolder(dirPath);
                    setCurrentDirectory(dirPath);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isExpanded ? (
                      <ChevronDown size={14} color="var(--color-text-muted)" />
                    ) : (
                      <ChevronRight size={14} color="var(--color-text-muted)" />
                    )}
                    {isExpanded ? (
                      <FolderOpen size={14} color="#38bdf8" />
                    ) : (
                      <Folder size={14} color="#38bdf8" />
                    )}
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: isCwd ? 700 : 500,
                        color: isCwd ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      }}
                    >
                      {dirName}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {directFiles.length} item{directFiles.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Direct Child Files */}
                {isExpanded &&
                  directFiles.map((fileEntry) => {
                    const isSelected = selectedFilePath === fileEntry.path;
                    const inode = state.inodes[fileEntry.inodeNumber];

                    return (
                      <div
                        key={fileEntry.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '4px 8px',
                          paddingLeft: `${(depth + 1) * 16 + 4}px`,
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: isSelected
                            ? 'rgba(168, 85, 247, 0.2)'
                            : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected
                            ? '1px solid #a855f7'
                            : '1px solid transparent',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                          marginTop: '1px',
                        }}
                        onClick={() => selectFile(fileEntry.path)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                          <FileText size={13} color={isSelected ? '#c084fc' : 'var(--color-text-secondary)'} />
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontFamily: 'var(--font-mono)',
                              fontWeight: isSelected ? 700 : 500,
                              color: isSelected ? '#e9d5ff' : 'var(--color-text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {fileEntry.name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {inode && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                color:
                                  inode.allocationStrategy === 'CONTIGUOUS'
                                    ? '#38bdf8'
                                    : inode.allocationStrategy === 'LINKED'
                                    ? '#4ade80'
                                    : '#fde047',
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                padding: '1px 4px',
                                borderRadius: '2px',
                              }}
                            >
                              {inode.allocationStrategy.substring(0, 4)}
                            </span>
                          )}

                          {inode && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              {inode.fileSizeBytes}B
                            </span>
                          )}

                          {/* Delete File Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              executeFileDeletion(fileEntry.path);
                            }}
                            title={`Delete ${fileEntry.name} and reclaim its blocks`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              padding: '2px',
                              borderRadius: '2px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}

          {state.directoryEntries.filter((e) => e.type === 'FILE').length === 0 && (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              No files currently stored on virtual disk.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
