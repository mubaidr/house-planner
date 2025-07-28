/**
 * Extended browser API types for File System Access API
 */

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface FilePickerOptions {
  types?: FilePickerAcceptType[];
  excludeAcceptAllOption?: boolean;
  suggestedName?: string;
}

interface FileSystemFileHandle {
  name: string;
  kind: 'file';
  createWritable(): Promise<FileSystemWritableFileStream>;
  getFile(): Promise<File>;
}

interface FileSystemWritableFileStream extends WritableStream {
  write(data: any): Promise<void>;
  close(): Promise<void>;
}

interface Window {
  showSaveFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle>;
  showOpenFilePicker?(options?: FilePickerOptions): Promise<FileSystemFileHandle[]>;
}
