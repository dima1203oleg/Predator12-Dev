"use strict";
// @ts-nocheck
/**
 * 📁 FILE DROPZONE
 *
 * Drag & Drop зона для завантаження файлів
 * Підтримка: CSV, XLSX, PDF, Images, Videos
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const material_1 = require("@mui/material");
const icons_material_1 = require("@mui/icons-material");
const framer_motion_1 = require("framer-motion");
const nexusThemeV2_1 = require("../../theme/nexusThemeV2");
// ============= HELPER FUNCTIONS =============
const getFileIcon = (type) => {
    if (type.includes('image'))
        return <icons_material_1.Image />;
    if (type.includes('video'))
        return <icons_material_1.VideoLibrary />;
    if (type.includes('pdf'))
        return <icons_material_1.PictureAsPdf />;
    if (type.includes('sheet') || type.includes('csv'))
        return <icons_material_1.TableChart />;
    return <icons_material_1.InsertDriveFile />;
};
const getFileTypeLabel = (type) => {
    if (type.includes('image'))
        return 'Image';
    if (type.includes('video'))
        return 'Video';
    if (type.includes('pdf'))
        return 'PDF';
    if (type.includes('sheet'))
        return 'XLSX';
    if (type.includes('csv'))
        return 'CSV';
    return 'File';
};
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};
// ============= COMPONENT =============
const FileDropzone = () => {
    const [files, setFiles] = (0, react_1.useState)([]);
    const [isDragging, setIsDragging] = (0, react_1.useState)(false);
    // File selection handler
    const handleFileSelect = (0, react_1.useCallback)((selectedFiles) => {
        const newFiles = Array.from(selectedFiles).map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            status: 'pending',
            progress: 0
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);
    // Drag & Drop handlers
    const handleDragOver = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    }, [handleFileSelect]);
    // File input change handler
    const handleInputChange = (0, react_1.useCallback)((e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files);
        }
    }, [handleFileSelect]);
    // Upload files
    const handleUpload = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        const pendingFiles = files.filter(f => f.status === 'pending');
        for (const fileItem of pendingFiles) {
            // Update status to uploading
            setFiles(prev => prev.map(f => f.id === fileItem.id ? Object.assign(Object.assign({}, f), { status: 'uploading', progress: 0 }) : f));
            try {
                // Simulate upload with progress
                for (let progress = 0; progress <= 100; progress += 10) {
                    yield new Promise(resolve => setTimeout(resolve, 200));
                    setFiles(prev => prev.map(f => f.id === fileItem.id ? Object.assign(Object.assign({}, f), { progress }) : f));
                }
                // TODO: Implement real API call
                // const formData = new FormData();
                // formData.append('file', fileItem.file);
                // await fetch('/api/ingest/upload', { method: 'POST', body: formData });
                // Success
                setFiles(prev => prev.map(f => f.id === fileItem.id ? Object.assign(Object.assign({}, f), { status: 'success', progress: 100 }) : f));
            }
            catch (error) {
                // Error
                setFiles(prev => prev.map(f => f.id === fileItem.id
                    ? Object.assign(Object.assign({}, f), { status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }) : f));
            }
        }
    }), [files]);
    // Remove file
    const handleRemove = (0, react_1.useCallback)((id) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    }, []);
    // Clear all
    const handleClearAll = (0, react_1.useCallback)(() => {
        setFiles([]);
    }, []);
    // Statistics
    const stats = {
        total: files.length,
        pending: files.filter(f => f.status === 'pending').length,
        uploading: files.filter(f => f.status === 'uploading').length,
        success: files.filter(f => f.status === 'success').length,
        error: files.filter(f => f.status === 'error').length
    };
    return (<material_1.Stack spacing={3}>
      {/* Dropzone */}
      <framer_motion_1.motion.div whileHover={{ scale: isDragging ? 1 : 1.01 }} transition={{ duration: 0.2 }}>
        <material_1.Card sx={{
            background: isDragging
                ? `linear-gradient(135deg, ${nexusThemeV2_1.nexusColorsDark.primary.main}20, ${nexusThemeV2_1.nexusColorsDark.secondary.main}20)`
                : nexusThemeV2_1.nexusColorsDark.background.paper,
            border: `2px dashed ${isDragging ? nexusThemeV2_1.nexusColorsDark.primary.main : nexusThemeV2_1.nexusColorsDark.border.medium}`,
            p: 6,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => { var _a; return (_a = document.getElementById('file-input')) === null || _a === void 0 ? void 0 : _a.click(); }}>
          <material_1.Stack spacing={2} alignItems="center">
            <icons_material_1.CloudUpload sx={{
            fontSize: 64,
            color: isDragging ? nexusThemeV2_1.nexusColorsDark.primary.main : nexusThemeV2_1.nexusColorsDark.text.secondary
        }}/>

            <material_1.Typography variant="h6" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
              {isDragging ? 'Drop files here' : 'Drag & Drop or Click to Upload'}
            </material_1.Typography>

            <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
              Supported: CSV, XLSX, PDF, Images (PNG, JPG, GIF), Videos (MP4, AVI)
            </material_1.Typography>

            <material_1.Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              <material_1.Chip label="CSV" size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.green + '20', color: nexusThemeV2_1.nexusColorsDark.accent.green }}/>
              <material_1.Chip label="XLSX" size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.cyan + '20', color: nexusThemeV2_1.nexusColorsDark.accent.cyan }}/>
              <material_1.Chip label="PDF" size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.orange + '20', color: nexusThemeV2_1.nexusColorsDark.accent.orange }}/>
              <material_1.Chip label="Images" size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.pink + '20', color: nexusThemeV2_1.nexusColorsDark.accent.pink }}/>
              <material_1.Chip label="Videos" size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.purple + '20', color: nexusThemeV2_1.nexusColorsDark.accent.purple }}/>
            </material_1.Stack>
          </material_1.Stack>

          <input id="file-input" type="file" multiple accept=".csv,.xlsx,.pdf,image/*,video/*" style={{ display: 'none' }} onChange={handleInputChange}/>
        </material_1.Card>
      </framer_motion_1.motion.div>

      {/* Statistics */}
      {files.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                p: 2
            }}>
          <material_1.Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <material_1.Stack direction="row" spacing={2}>
              <material_1.Chip label={`Total: ${stats.total}`} size="small" sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.primary.main + '20', color: nexusThemeV2_1.nexusColorsDark.primary.main }}/>
              <material_1.Chip label={`Pending: ${stats.pending}`} size="small" icon={<icons_material_1.Schedule />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.accent.yellow + '20', color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>
              <material_1.Chip label={`Success: ${stats.success}`} size="small" icon={<icons_material_1.CheckCircle />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.success + '20', color: nexusThemeV2_1.nexusColorsDark.status.success }}/>
              {stats.error > 0 && (<material_1.Chip label={`Errors: ${stats.error}`} size="small" icon={<icons_material_1.Error />} sx={{ bgcolor: nexusThemeV2_1.nexusColorsDark.status.error + '20', color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
            </material_1.Stack>

            <material_1.Stack direction="row" spacing={1}>
              <material_1.Button variant="contained" size="small" startIcon={<icons_material_1.CloudUpload />} disabled={stats.pending === 0} onClick={handleUpload} sx={{
                background: nexusThemeV2_1.nexusColorsDark.gradients.primary,
                '&:disabled': {
                    background: nexusThemeV2_1.nexusColorsDark.border.light
                }
            }}>
                Upload ({stats.pending})
              </material_1.Button>
              <material_1.Button variant="outlined" size="small" onClick={handleClearAll} sx={{
                borderColor: nexusThemeV2_1.nexusColorsDark.border.medium,
                color: nexusThemeV2_1.nexusColorsDark.text.secondary
            }}>
                Clear All
              </material_1.Button>
            </material_1.Stack>
          </material_1.Stack>
        </material_1.Card>)}

      {/* File List */}
      {files.length > 0 && (<material_1.Card sx={{
                background: nexusThemeV2_1.nexusColorsDark.background.paper,
                border: `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}`,
                maxHeight: 500,
                overflow: 'auto'
            }}>
          <material_1.List>
            {files.map((fileItem, index) => (<material_1.ListItem key={fileItem.id} sx={{
                    borderBottom: index < files.length - 1 ? `1px solid ${nexusThemeV2_1.nexusColorsDark.border.light}` : 'none'
                }}>
                <material_1.ListItemIcon>
                  {getFileIcon(fileItem.file.type)}
                </material_1.ListItemIcon>

                <material_1.ListItemText primary={<material_1.Stack direction="row" spacing={1} alignItems="center">
                      <material_1.Typography variant="body2" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.primary }}>
                        {fileItem.file.name}
                      </material_1.Typography>
                      <material_1.Chip label={getFileTypeLabel(fileItem.file.type)} size="small" sx={{ height: 20 }}/>
                    </material_1.Stack>} secondary={<material_1.Stack spacing={0.5} sx={{ mt: 1 }}>
                      <material_1.Typography variant="caption" sx={{ color: nexusThemeV2_1.nexusColorsDark.text.secondary }}>
                        {formatFileSize(fileItem.file.size)}
                      </material_1.Typography>

                      {fileItem.status === 'uploading' && (<material_1.Box sx={{ width: '100%' }}>
                          <material_1.LinearProgress variant="determinate" value={fileItem.progress} sx={{
                            '& .MuiLinearProgress-bar': {
                                background: nexusThemeV2_1.nexusColorsDark.gradients.primary
                            }
                        }}/>
                        </material_1.Box>)}

                      {fileItem.status === 'error' && (<material_1.Alert severity="error" sx={{ py: 0 }}>
                          {fileItem.error || 'Upload failed'}
                        </material_1.Alert>)}
                    </material_1.Stack>}/>

                <material_1.ListItemSecondaryAction>
                  <material_1.Stack direction="row" spacing={1} alignItems="center">
                    {fileItem.status === 'success' && (<icons_material_1.CheckCircle sx={{ color: nexusThemeV2_1.nexusColorsDark.status.success }}/>)}
                    {fileItem.status === 'error' && (<icons_material_1.Error sx={{ color: nexusThemeV2_1.nexusColorsDark.status.error }}/>)}
                    {fileItem.status === 'pending' && (<icons_material_1.Schedule sx={{ color: nexusThemeV2_1.nexusColorsDark.accent.yellow }}/>)}

                    <material_1.IconButton size="small" onClick={() => handleRemove(fileItem.id)} disabled={fileItem.status === 'uploading'}>
                      <icons_material_1.Delete />
                    </material_1.IconButton>
                  </material_1.Stack>
                </material_1.ListItemSecondaryAction>
              </material_1.ListItem>))}
          </material_1.List>
        </material_1.Card>)}
    </material_1.Stack>);
};
exports.default = FileDropzone;
