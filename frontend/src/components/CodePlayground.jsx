import React, { useState, useEffect } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { 
  Play, 
  Trash2, 
  Copy, 
  Save, 
  Download, 
  Upload, 
  RefreshCw,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  Terminal,
  X,
  Edit2,
  Trash,
  Maximize2,
  Minimize2
} from 'lucide-react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/active-line';

const CodePlayground = () => {
  const [code, setCode] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState([]);
  const [projectPackages, setProjectPackages] = useState({
    dependencies: {},
    devDependencies: {}
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [isDevServerRunning, setIsDevServerRunning] = useState(false);
  const [projectName, setProjectName] = useState('');
  const terminalInputRef = React.useRef(null);
  
  const [consoleOutput, setConsoleOutput] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isFullScreenConsole, setIsFullScreenConsole] = useState(false);
  const [fileStructure, setFileStructure] = useState({
    id: 'root',
    name: 'workspace',
    type: 'folder',
    children: [
      {
        id: '1',
        name: 'main.js',
        type: 'file',
        content: '// Ana dosya\nconsole.log("Ana dosya çalışıyor!");'
      }
    ]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));

  useEffect(() => {
    const saved = localStorage.getItem('fileStructure');
    if (saved) {
      setFileStructure(JSON.parse(saved));
    }
  }, []);

  const saveFileStructure = (newStructure) => {
    localStorage.setItem('fileStructure', JSON.stringify(newStructure));
    setFileStructure(newStructure);
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => setNotification({ show: false, message: '' }), 2000);
  };

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const findItemById = (structure, id) => {
    if (structure.id === id) return structure;
    if (structure.children) {
      for (const child of structure.children) {
        const found = findItemById(child, id);
        if (found) return found;
      }
    }
    return null;
  };

  const createItem = (type) => {
    if (!newItemName) {
      showNotification('Lütfen bir isim girin!');
      return;
    }

    const extension = type === 'file' ? (newItemName.includes('.') ? '' : '.js') : '';
    const newItem = {
      id: Date.now().toString(),
      name: newItemName + extension,
      type: type,
      ...(type === 'file' ? { content: '' } : { children: [] })
    };

    const newStructure = {
      ...fileStructure,
      children: [...fileStructure.children, newItem]
    };

    saveFileStructure(newStructure);
    setNewItemName('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    showNotification(`${type === 'file' ? 'Dosya' : 'Klasör'} oluşturuldu!`);
  };

  const deleteItem = (id) => {
    const deleteFromStructure = (structure) => {
      if (structure.children) {
        structure.children = structure.children.filter(child => child.id !== id);
        structure.children.forEach(child => deleteFromStructure(child));
      }
      return structure;
    };

    const newStructure = deleteFromStructure({ ...fileStructure });
    saveFileStructure(newStructure);
    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setCode('');
    }
    showNotification('Öğe silindi!');
  };

  const selectFile = (file) => {
    setSelectedFile(file);
    setCode(file.content);
  };

  const saveCurrentFile = () => {
    if (!selectedFile) {
      showNotification('Lütfen önce bir dosya seçin!');
      return;
    }

    const updateFileContent = (structure) => {
      if (structure.id === selectedFile.id) {
        return { ...structure, content: code };
      }
      if (structure.children) {
        return {
          ...structure,
          children: structure.children.map(child => updateFileContent(child))
        };
      }
      return structure;
    };

    const newStructure = updateFileContent(fileStructure);
    saveFileStructure(newStructure);
    showNotification('Dosya kaydedildi!');
  };

  const copyToClipboard = async () => {
    if (!code) {
      showNotification('Kopyalanacak kod bulunamadı!');
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      showNotification('Kod başarıyla kopyalandı!');
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
      showNotification('Kopyalama başarısız!');
    }
  };

  const downloadCode = () => {
    if (!selectedFile) {
      showNotification('Lütfen önce bir dosya seçin!');
      return;
    }
    
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Dosya indirildi!');
  };

  const clearConsole = () => {
    setConsoleOutput([]);
    setError(null);
  };

  // Dosya işlemleri ve diğer yardımcı fonksiyonlar...
  const toggleConsole = () => {
    setIsConsoleOpen(!isConsoleOpen);
    if (!isConsoleOpen) {
      setIsFullScreenConsole(false);
    }
  };

  // Terminalde komut çalıştırma
  const executeCommand = async (command) => {
    const parts = command.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Komut geçmişine ekle
    setCommandHistory(prev => [...prev, command]);
    
    // npm create vite@latest js komutu için özel kontrol
    if (cmd === 'npm' && args[0] === 'create' && args[1] === 'vite@latest' && args[2]) {
      createViteProject(args[2]);
      return;
    }

    // Diğer temel komutlar
    switch (cmd) {
      case 'clear':
        clearConsole();
        return;
      
      case 'help':
        addTerminalOutput('info', `Kullanılabilir komutlar:
- npm create vite@latest <proje-adı>: Yeni Vite projesi oluşturma
- clear: Terminal temizleme
- help: Yardım görüntüleme
- ls: Dosyaları listeleme`);
        return;

      case 'ls':
        listFiles();
        return;

      default:
        addTerminalOutput('error', `Komut bulunamadı: ${cmd}`);
        return;
    }
  };

  const createViteProject = async (projectName) => {
    addTerminalOutput('info', `🚀 Vite projesi oluşturuluyor: ${projectName}...`);
    
    // Vite proje yapısını oluştur
    const viteProject = {
      id: 'vite-project',
      name: projectName,
      type: 'folder',
      children: [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          children: [
            {
              id: 'app-jsx',
              name: 'App.jsx',
              type: 'file',
              content: `import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}`
            },
            {
              id: 'app-css',
              name: 'App.css',
              type: 'file',
              content: `#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.card {
  padding: 2em;
}`
            },
            {
              id: 'main-jsx',
              name: 'main.jsx',
              type: 'file',
              content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
            },
            {
              id: 'index-css',
              name: 'index.css',
              type: 'file',
              content: `:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}`
            }
          ]
        },
        {
          id: 'public',
          name: 'public',
          type: 'folder',
          children: [
            {
              id: 'vite-svg',
              name: 'vite.svg',
              type: 'file',
              content: '<!-- Vite Logo SVG -->'
            }
          ]
        },
        {
          id: 'index-html',
          name: 'index.html',
          type: 'file',
          content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
        },
        {
          id: 'package-json',
          name: 'package.json',
          type: 'file',
          content: `{
  "name": "${projectName}",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}`
        },
        {
          id: 'vite-config',
          name: 'vite.config.js',
          type: 'file',
          content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        }
      ]
    };

    // Simüle edilmiş yükleme süresi
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Dosya yapısını güncelle
    setFileStructure(prevStructure => ({
      ...prevStructure,
      children: [...prevStructure.children, viteProject]
    }));

    addTerminalOutput('success', `✅ Vite projesi başarıyla oluşturuldu: ${projectName}`);
    addTerminalOutput('info', 'Proje bağımlılıkları hazır:');
    addTerminalOutput('log', '- react@18.2.0');
    addTerminalOutput('log', '- react-dom@18.2.0');
    addTerminalOutput('log', '- vite@5.0.8');
    addTerminalOutput('info', '\nKullanmaya başlamak için:');
    addTerminalOutput('log', `cd ${projectName}`);
    addTerminalOutput('log', 'npm install');
    addTerminalOutput('log', 'npm run dev');
  };

  const addTerminalOutput = (type, content) => {
    setConsoleOutput(prev => [...prev, {
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleTerminalInput = (e) => {
    if (e.key === 'Enter' && terminalInput.trim()) {
      executeCommand(terminalInput);
      setTerminalInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setTerminalInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setTerminalInput('');
      }
    }
  };

  const createFolder = (folderName) => {
    const newFolder = {
      id: Date.now().toString(),
      name: folderName,
      type: 'folder',
      children: []
    };

    setFileStructure(prev => ({
      ...prev,
      children: [...prev.children, newFolder]
    }));
    addTerminalOutput('success', `📁 Klasör oluşturuldu: ${folderName}`);
  };

  const createFile = (fileName) => {
    const extension = fileName.includes('.') ? '' : '.js';
    const newFile = {
      id: Date.now().toString(),
      name: fileName + extension,
      type: 'file',
      content: ''
    };

    setFileStructure(prev => ({
      ...prev,
      children: [...prev.children, newFile]
    }));
    addTerminalOutput('success', `📄 Dosya oluşturuldu: ${fileName}${extension}`);
  };

  const listFiles = () => {
    addTerminalOutput('info', 'Dosya listesi:');
    fileStructure.children.forEach(item => {
      addTerminalOutput('log', `${item.type === 'folder' ? '📁' : '📄'} ${item.name}`);
    });
  };

  const runCode = () => {
    setConsoleOutput([]);
    setError(null);
    setIsConsoleOpen(true);

    try {
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;
      const consoleLogs = [];

      console.log = (...args) => {
        consoleLogs.push({
          type: 'log',
          content: args.map(String).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        consoleLogs.push({
          type: 'error',
          content: args.map(String).join(' '),
          timestamp: new Date().toLocaleTimeString()
        });
        originalConsoleError(...args);
      };

      const result = eval(`(function(){
        ${code}
      })()`);

      if (result !== undefined) {
        consoleLogs.push({
          type: 'return',
          content: String(result),
          timestamp: new Date().toLocaleTimeString()
        });
      }

      setConsoleOutput(consoleLogs);
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // Diğer fonksiyonlar aynı kalacak...
  
  const ConsoleModal = () => {
    if (!isConsoleOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div 
          className={`
            bg-gray-900 rounded-lg shadow-2xl border border-gray-700
            ${isFullScreenConsole ? 'w-full h-full rounded-none' : 'w-4/5 max-w-4xl max-h-[70vh]'}
            transition-all duration-200
          `}
        >
          {/* Konsol Başlığı */}
          <div className="bg-gray-800 p-3 flex items-center justify-between rounded-t-lg border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Terminal size={18} className="text-green-500" />
              <h2 className="text-sm font-semibold">Terminal</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFullScreenConsole(!isFullScreenConsole)}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              >
                {isFullScreenConsole ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button 
                onClick={clearConsole}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={toggleConsole}
                className="p-1.5 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Konsol İçeriği */}
          <div className={`
            p-4 font-mono text-sm space-y-2 overflow-y-auto bg-gray-900
            ${isFullScreenConsole ? 'h-[calc(100vh-7rem)]' : 'max-h-[60vh]'}
          `}>
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <span className="text-xs">❯</span>
              <span className="font-medium">Terminal başlatıldı</span>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 p-2 bg-red-950/30 rounded-md">
                <span className="text-xs mt-1">❯</span>
                <div>
                  <span className="font-medium">Hata</span>
                  <p className="mt-1 text-red-300">{error}</p>
                </div>
              </div>
            )}

            {consoleOutput.map((log, index) => (
              <div 
                key={index} 
                className={`
                  flex items-start gap-2 p-2 rounded-md
                  ${log.type === 'error' ? 'text-red-400 bg-red-950/30' : 
                    log.type === 'return' ? 'text-yellow-400 bg-yellow-950/30' : 
                    'text-green-400 bg-green-950/30'}
                `}
              >
                <span className="text-xs mt-1">❯</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {log.type === 'error' ? 'Hata' : 
                       log.type === 'return' ? 'Dönüş Değeri' : 
                       'Çıktı'}
                    </span>
                    <span className="text-xs text-gray-500">{log.timestamp}</span>
                  </div>
                  <p className="mt-1 font-normal">{log.content}</p>
                </div>
              </div>
            ))}

            {/* Terminal Giriş Alanı */}
            <div className="mt-4 flex items-center gap-2 bg-gray-800 p-2 rounded-md">
              <span className="text-green-400">❯</span>
              <input
                ref={terminalInputRef}
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                onKeyDown={handleTerminalInput}
                placeholder="Komut girin... (help yazarak komutları görüntüleyin)"
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                autoFocus
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Dosya yapısı render fonksiyonu...
  const renderFileStructure = (item) => {
    const isExpanded = expandedFolders.has(item.id);
    
    return (
      <div key={item.id} className="ml-4">
        <div 
          className={`
            flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer group
            ${selectedFile?.id === item.id ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-gray-700/50'}
            transition-colors duration-150
          `}
        >
          {item.type === 'folder' ? (
            <>
              <button 
                onClick={() => toggleFolder(item.id)} 
                className="p-0.5 hover:bg-gray-600 rounded"
              >
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              <Folder size={14} className="text-yellow-500/90" />
            </>
          ) : (
            <>
              <File size={14} className="text-blue-400/90 ml-5" />
            </>
          )}
          <span 
            className="flex-grow text-sm"
            onClick={() => item.type === 'file' && selectFile(item)}
          >
            {item.name}
          </span>
          <button 
            onClick={() => deleteItem(item.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded transition-opacity"
          >
            <Trash size={12} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>
        {item.type === 'folder' && isExpanded && item.children?.map(child => renderFileStructure(child))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Dosya Gezgini */}
      <div className="w-64 bg-gray-800/50 border-r border-gray-700/50 flex flex-col">
        <div className="p-3 border-b border-gray-700/50">
          <h2 className="text-xs font-semibold text-gray-400 mb-2">DOSYA GEZGİNİ</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCreatingFile(true)}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="Yeni Dosya"
            >
              <FilePlus size={16} />
            </button>
            <button
              onClick={() => setIsCreatingFolder(true)}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="Yeni Klasör"
            >
              <FolderPlus size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {renderFileStructure(fileStructure)}
          
          {/* Yeni Dosya/Klasör Oluşturma Formu */}
          {(isCreatingFile || isCreatingFolder) && (
            <div className="mt-2 p-3 bg-gray-700/50 rounded-md">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`${isCreatingFile ? 'Dosya' : 'Klasör'} adı`}
                className="w-full bg-gray-800 text-white p-2 rounded-md mb-2 text-sm border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => createItem(isCreatingFile ? 'file' : 'folder')}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  Oluştur
                </button>
                <button
                  onClick={() => {
                    setIsCreatingFile(false);
                    setIsCreatingFolder(false);
                    setNewItemName('');
                  }}
                  className="bg-gray-600 hover:bg-gray-500 px-3 py-1.5 rounded-md text-sm transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="flex-1 flex flex-col">
        {/* Editör Başlığı */}
        <div className="bg-gray-800/50 p-3 flex items-center justify-between border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-gray-300">
              {selectedFile ? selectedFile.name : 'Yeni Dosya'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={copyToClipboard}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="Kopyala"
            >
              <Copy size={16} />
            </button>
            <button 
              onClick={saveCurrentFile}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="Kaydet"
            >
              <Save size={16} />
            </button>
            <button 
              onClick={downloadCode}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="İndir"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={toggleConsole}
              className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
              title="Terminal"
            >
              <Terminal size={16} />
            </button>
            <button 
              onClick={runCode}
              className="bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors ml-2"
            >
              <Play size={16} />
              <span className="text-sm font-medium">Çalıştır</span>
            </button>
          </div>
        </div>

        {/* Editör */}
        <div className="flex-1 relative [&_.CodeMirror]:h-full [&_.CodeMirror-lines]:!pt-0 [&_.CodeMirror-code]:!mt-0">
          <CodeMirror
            value={code}
            options={{
              mode: 'javascript',
              theme: 'material',
              lineNumbers: true,
              lineWrapping: true,
              autoCloseBrackets: true,
              matchBrackets: true,
              styleActiveLine: true,
              tabSize: 2,
              firstLineNumber: 1,
              extraKeys: {
                "Ctrl-Space": "autocomplete"
              },
              viewportMargin: Infinity
            }}
            onBeforeChange={(editor, data, value) => {
              setCode(value);
            }}
          />
        </div>

        {/* Konsol Modal */}
        <ConsoleModal />

        {/* Bildirim */}
        {notification.show && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {notification.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePlayground;